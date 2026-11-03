export {}

declare global {
  interface Window {
    google?: typeof google
  }

  namespace google {
    namespace accounts {
      namespace id {
        interface CredentialResponse {
          credential?: string
          select_by?: string
        }

        interface RenderButtonOptions {
          theme?: "outline" | "filled_blue" | "filled_black"
          size?: "small" | "medium" | "large"
          type?: "standard" | "icon"
          shape?: "rectangular" | "pill" | "circle" | "square"
          text?: "signin_with" | "signup_with" | "continue_with" | "signin"
          logo_alignment?: "left" | "center"
          width?: string | number
        }

        interface IdConfiguration {
          client_id: string
          callback: (response: CredentialResponse) => void
          auto_select?: boolean
          context?: "signin" | "signup" | "use"
        }

        interface IdPrompt {
          (momentListener?: (promptMomentNotification: unknown) => void): void
        }

        interface AccountsId {
          initialize: (configuration: IdConfiguration) => void
          renderButton: (parent: HTMLElement, options: RenderButtonOptions) => void
          prompt: IdPrompt
        }
      }
    }
  }
}

