window.WebChat.renderWebChat({
    className: 'webchat__chat',
    directLine: window.WebChat.createDirectLine({
      token: 'Hn6enMHa6dY.YQ64B8fdnFuBvW0cxS_j1v-0f-_oIwXAST6h-4AnC1U'
    }),
    styleOptions: {
      hideUploadButton: true,
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
      rootHeight: '380px',
      rootWidth: 'fit-content',
      bubbleFromUserBackground: '#f2f2f2',
      bubbleFromUserBorderColor: '#e0e0e0',
      bubbleFromUserBorderRadius: 8,
      bubbleFromUserBorderWidth: 2,
      bubbleFromUserNubOffset: 0,
      bubbleFromUserNubSize: 10,
      groupTimestamp: 3000,
      showAvatarInGroup: 'status',
    
    }
  }, document.getElementById('webchat'))
  

  