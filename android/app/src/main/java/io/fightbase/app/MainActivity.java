package io.fightbase.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

/**
 * Die App ist eine WebView auf fightbase.io (siehe capacitor.config.ts). Zwei
 * Dinge, die Capacitor in dieser Lage nicht mitbringt, stehen hier.
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
