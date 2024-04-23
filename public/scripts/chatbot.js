window.WebChat.renderWebChat({
    className: 'webchat__chat',
    directLine: window.WebChat.createDirectLine({
      token: 'bmQmB_t4MwU.WpStaCcojPX0LIQuiY3av2UXRK3bl67vexpsD_3L8Qk'
    }),
    styleOptions: {
      botAvatarImage: './resources/img/logo_ovalado.png',
      botAvatarInitials: 'BS',
      userAvatarImage: './resources/img/exito.png',
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
  

  