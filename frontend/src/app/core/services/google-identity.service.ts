import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";

type GoogleCredentialResponse = {
  credential: string;
};

type GoogleButtonContext = "signin" | "signup";

type GoogleButtonOptions = {
  host: HTMLElement;
  onCredential: (credential: string) => void;
  clientId: string;
  context: GoogleButtonContext;
};

type GoogleIdApi = {
  initialize(config: {
    callback: (response: GoogleCredentialResponse) => void;
    cancel_on_tap_outside?: boolean;
    client_id: string;
    context?: GoogleButtonContext;
    itp_support?: boolean;
    ux_mode?: "popup";
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      shape?: "pill";
      size?: "large";
      text?: "continue_with" | "signup_with";
      theme?: "outline";
      width?: number;
    },
  ): void;
};

type GoogleApi = {
  accounts: {
    id: GoogleIdApi;
  };
};

declare global {
  interface Window {
    google?: GoogleApi;
  }
}

@Injectable({ providedIn: "root" })
export class GoogleIdentityService {
  private readonly document = inject(DOCUMENT);
  private scriptPromise?: Promise<void>;

  async renderButton(options: GoogleButtonOptions): Promise<void> {
    await this.loadScript();

    const googleId = window.google?.accounts.id;
    if (!googleId) throw new Error("Google Identity Services could not be loaded");

    options.host.replaceChildren();

    googleId.initialize({
      callback: ({ credential }) => options.onCredential(credential),
      cancel_on_tap_outside: true,
      client_id: options.clientId,
      context: options.context,
      itp_support: true,
      ux_mode: "popup",
    });

    const containerWidth = Math.max(Math.round(options.host.getBoundingClientRect().width), 280);

    googleId.renderButton(options.host, {
      shape: "pill",
      size: "large",
      text: options.context === "signup" ? "signup_with" : "continue_with",
      theme: "outline",
      width: containerWidth,
    });
  }

  private loadScript(): Promise<void> {
    if (window.google?.accounts.id) return Promise.resolve();
    if (this.scriptPromise) return this.scriptPromise;

    this.scriptPromise = new Promise<void>((resolve, reject) => {
      const existingScript = this.document.getElementById("google-identity-script");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Google Identity Services failed to load")),
          { once: true },
        );
        return;
      }

      const script = this.document.createElement("script");
      script.id = "google-identity-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Google Identity Services failed to load"));
      this.document.head.append(script);
    });

    return this.scriptPromise;
  }
}
