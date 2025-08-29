export const DisableInputExtension = {
  name: 'DisableInput',
  type: 'effect',
  match: ({ trace }) =>
    trace.type === 'ext_disableInput' || trace.payload?.name === 'ext_disableInput',
  effect: ({ trace }) => {
    const { isDisabled } = trace.payload

    function disableInput() {
      const chatDiv = document.getElementById('voiceflow-chat')

      if (chatDiv) {
        const shadowRoot = chatDiv.shadowRoot
        if (shadowRoot) {
          const v3InputContainerClass = '.vfrc-input-container';
          const chatInput = shadowRoot.querySelector(v3InputContainerClass) || shadowRoot.querySelector('.vfrc-chat-input');
          const textarea = shadowRoot.querySelector(v3InputContainerClass + ' textarea') || shadowRoot.querySelector(
            'textarea[id^="vf-chat-input--"]'
          );
          const v3Buttons = shadowRoot.querySelectorAll(v3InputContainerClass + ' button');
          const button = shadowRoot.querySelector('.vfrc-chat-input--button')

          if (chatInput && textarea && (v3Buttons.length > 0 || button)) {
            // Add a style tag if it doesn't exist
            let styleTag = shadowRoot.querySelector('#vf-disable-input-style')
            if (!styleTag) {
              styleTag = document.createElement('style')
              styleTag.id = 'vf-disable-input-style'
              styleTag.textContent = `
                .vf-no-border, .vf-no-border * {
                  border: none !important;
                }
                .vf-hide-button {
                  display: none !important;
                }
              `
              shadowRoot.appendChild(styleTag)
            }

            function updateInputState() {
              textarea.disabled = isDisabled
              if (!isDisabled) {
                textarea.placeholder = 'Message...'
                chatInput.classList.remove('vf-no-border')
                if (v3Buttons.length > 0) {
                  v3Buttons.forEach(b => b.classList.remove('vf-hide-button'));
                } else {
                  button.classList.remove('vf-hide-button')
                }
                // Restore original value getter/setter
                Object.defineProperty(
                  textarea,
                  'value',
                  originalValueDescriptor
                )
              } else {
                textarea.placeholder = ''
                chatInput.classList.add('vf-no-border')
                if (v3Buttons.length > 0) {
                  v3Buttons.forEach(b => b.classList.add('vf-hide-button'));
                  textarea.style.backgroundColor = 'transparent';
                } else {
                  button.classList.add('vf-hide-button')
                }
                Object.defineProperty(textarea, 'value', {
                  get: function () {
                    return ''
                  },
                  configurable: true,
                })
              }

              // Trigger events to update component state
              textarea.dispatchEvent(
                new Event('input', { bubbles: true, cancelable: true })
              )
              textarea.dispatchEvent(
                new Event('change', { bubbles: true, cancelable: true })
              )
            }

            // Store original value descriptor
            const originalValueDescriptor = Object.getOwnPropertyDescriptor(
              HTMLTextAreaElement.prototype,
              'value'
            )

            // Initial update
            updateInputState()
          } else {
            console.error('Chat input, textarea, or button not found')
          }
        } else {
          console.error('Shadow root not found')
        }
      } else {
        console.error('Chat div not found')
      }
    }

    disableInput()
  },
}
