window.WebChat.renderWebChat({
    className: 'webchat__chat',
    directLine: window.WebChat.createDirectLine({
      token: 'bmQmB_t4MwU.WpStaCcojPX0LIQuiY3av2UXRK3bl67vexpsD_3L8Qk'
    }),
    styleOptions: {
      botAvatarImage: '../img/logo.png',
      botAvatarInitials: 'BS',
      userAvatarImage: 'assets/img/user.png',
      userAvatarInitials: 'Yo',
      bubbleBackground: '#e6e6e6',
      bubbleBorderColor: '#cccccc',
      bubbleBorderRadius: 8,
      bubbleBorderWidth: 2,
      bubbleNubOffset: 0,
      bubbleNubSize: 10,
      rootHeight: '495px',
      rootWidth: 'fit-content',
      bubbleFromUserBackground: '#f2f2f2',
      bubbleFromUserBorderColor: '#e0e0e0',
      bubbleFromUserBorderRadius: 8,
      bubbleFromUserBorderWidth: 2,
      bubbleFromUserNubOffset: 0,
      bubbleFromUserNubSize: 10,
      groupTimestamp: 3000,
      showAvatarInGroup: 'status'
    }
  }, document.getElementById('webchat'))
  .then(() => {
    // Scroll automático al final del chat
    const chatElement = document.querySelector('.webchat__chat .webchat__basic-transcript');
    chatElement.scrollTo({
      top: chatElement.scrollHeight,
      behavior: 'smooth'
    });
  
    // Estilos CSS para personalizar y ocultar el scrollbar
    const style = document.createElement('style');
    style.textContent = `
      .webchat__basic-transcript::-webkit-scrollbar {
        width: 8px;
      }
      .webchat__basic-transcript::-webkit-scrollbar-thumb {
        background-color: #888;
      }
      .webchat__basic-transcript::-webkit-scrollbar-track {
        background-color: #f4f4f4;
      }
    `;
    document.head.appendChild(style);
  
    // Estilos CSS para ocultar el scrollbar
    const hideScrollbarStyle = document.createElement('style');
    hideScrollbarStyle.textContent = `
      .webchat__basic-transcript {
        scrollbar-width: none;  /* Para Firefox */
      }
      .webchat__basic-transcript::-webkit-scrollbar {
        display: none;  /* Para Chrome, Safari, y Edge */
      }
    `;
    document.head.appendChild(hideScrollbarStyle);
  });
  
