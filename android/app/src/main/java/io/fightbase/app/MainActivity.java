package io.fightbase.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

/**
 * Die App ist eine WebView auf fightbase.io (siehe capacitor.config.ts). Drei
 * Dinge, die Capacitor in dieser Lage nicht richtig macht, stehen hier.
 *
 * 1) Die Zurueck-Taste. Capacitor 8 bringt fuer Android kein eigenes
 *    Back-Handling mehr mit — im Paket @capacitor/android kommt "BackPressed"
 *    an keiner Stelle vor, und @capacitor/app ist hier nicht installiert.
 *    Ohne die Behandlung unten schliesst die Zurueck-Taste auf der zweiten
 *    Seite die App, statt zur vorigen zurueckzugehen.
 *
 * 2) Deep Links. Mit dem Intent-Filter im Manifest oeffnet ein Link auf
 *    fightbase.io die App. Capacitor laedt die Ziel-URL aber nicht von selbst:
 *    Beim Kaltstart steht die Startseite da, und bei laufender App passiert
 *    ueberhaupt nichts. Die URL muss von Hand in die WebView.
 *
 * 3) Die Offline-Seite darf nicht bei HTTP-Fehlern erscheinen. Capacitors
 *    BridgeWebViewClient leitet sowohl bei onReceivedError (keine Verbindung)
 *    als auch bei onReceivedHttpError (Server antwortet mit 404, 500, ...) auf
 *    server.errorPath um. Der zweite Fall ist falsch: Ein 404 von fightbase.io
 *    ist eine Antwort der Seite, und die Seite hat dafuer eine eigene
 *    Fehlerseite. "Keine Verbindung" waere dort schlicht gelogen.
 */
public class MainActivity extends BridgeActivity {

    /**
     * Hosts, deren URLs in die WebView geladen werden duerfen.
     *
     * Bewusst eine Positivliste: Ein Intent kommt von aussen, und jede fremde
     * App darf einen schicken. Ohne die Pruefung wuerde die App jede beliebige
     * URL in ihrer eigenen WebView oeffnen — mit der angemeldeten
     * Supabase-Sitzung darin.
     */
    private static final String[] ALLOWED_HOSTS = {"fightbase.io", "www.fightbase.io"};

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        keepServerErrorPages();
        registerBackHandling();
        openDeepLink(getIntent());
    }

    /**
     * Die App laeuft schon und bekommt einen Link geschickt. Ohne setIntent()
     * gaebe getIntent() spaeter weiterhin den Start-Intent zurueck.
     */
    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        openDeepLink(intent);
    }

    /**
     * Die Offline-Seite nur noch bei echten Verbindungsfehlern zeigen.
     *
     * onReceivedError bleibt wie von Capacitor gebaut — kein Netz, kein DNS,
     * abgelehnte Verbindung. onReceivedHttpError wird abgeschaltet: Dort hat
     * der Server geantwortet, nur eben mit einem Fehlerstatus. Eine
     * Eventseite, die es nicht gibt, liefert 404 und rendert die 404-Seite von
     * Fightbase; die gehoert angezeigt und nicht durch "No connection"
     * ersetzt.
     *
     * Der leere Rumpf verliert nichts: Die Fassung von Capacitor ruft dort
     * ausser der Weiterleitung nur getWebViewListeners() auf, und weder
     * @capacitor/splash-screen noch @capacitor/status-bar horchen auf dieses
     * Ereignis (nachgesehen in beiden Plugins). Aufrufbar waere die Liste von
     * hier ohnehin nicht — die Methode ist paketprivat.
     */
    private void keepServerErrorPages() {
        Bridge bridge = getBridge();
        if (bridge == null) return;

        bridge.setWebViewClient(
                new BridgeWebViewClient(bridge) {
                    @Override
                    public void onReceivedHttpError(
                            WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
                        // Absichtlich nichts: die Antwort der Seite stehen lassen.
                    }
                });
    }

    private void registerBackHandling() {
        getOnBackPressedDispatcher()
                .addCallback(
                        this,
                        new OnBackPressedCallback(true) {
                            @Override
                            public void handleOnBackPressed() {
                                WebView webView = webView();
                                if (webView != null && webView.canGoBack()) {
                                    webView.goBack();
                                    return;
                                }
                                // Nichts mehr im Verlauf: abschalten und den
                                // Druck normal weiterreichen, damit Android die
                                // App schliesst. Ein direktes finish() wuerde
                                // an der vorhersagenden Zurueck-Geste vorbei
                                // arbeiten.
                                setEnabled(false);
                                getOnBackPressedDispatcher().onBackPressed();
                            }
                        });
    }

    private void openDeepLink(Intent intent) {
        if (intent == null || !Intent.ACTION_VIEW.equals(intent.getAction())) return;

        Uri data = intent.getData();
        if (data == null || !isAllowed(data)) return;

        WebView webView = webView();
        if (webView == null) return;

        // post() statt loadUrl() direkt: Beim Kaltstart laeuft Capacitors
        // eigener Ladevorgang auf die server.url noch, und ein sofortiger
        // zweiter loadUrl() wuerde von ihm ueberholt.
        String url = data.toString();
        webView.post(() -> webView.loadUrl(url));
    }

    private boolean isAllowed(Uri uri) {
        if (!"https".equalsIgnoreCase(uri.getScheme())) return false;
        String host = uri.getHost();
        if (host == null) return false;
        for (String allowed : ALLOWED_HOSTS) {
            if (allowed.equalsIgnoreCase(host)) return true;
        }
        return false;
    }

    private WebView webView() {
        return getBridge() == null ? null : getBridge().getWebView();
    }
}
