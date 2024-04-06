function toggleChat() {
    var webchat = document.getElementById('webchat');

 if (webchat.style.display === '' || webchat.style.display === 'none') {
        // Si el chat está cerrado o no se ha mostrado, ábrelo
        webchat.style.display = 'block';
        webchat.style.display = 'block';
    } else {
        // Si el chat está abierto, ciérralo
        webchat.style.display = 'none';
    }
}

function minimizarChat() {
    var webchat = document.getElementById('webchat');
webchat.style.display = 'none';
}




window.WebChat.renderWebChat({
className: 'webchat__chat',
directLine: window.WebChat.createDirectLine({
  token: 'hc_CeaYWjEI.q8hoxtqATRY_IGDyIsZmJVBUmPwbwNSRo7CmX0w6qn8'}),
styleOptions: {
botAvatarImage: 'assets/img/guest.png',
botAvatarInitials: 'BS',
userAvatarImage: 'assets/img/user.png',
userAvatarInitials: 'Yo',
//    botAvatarInitials: 'Bot',
//           userAvatarInitials: 'Yo',

      bubbleBackground: '#F4F4F4',
      bubbleBorderColor: '#F4F4F4',
      bubbleBorderRadius: 4,
      bubbleBorderWidth: 2,
      bubbleNubOffset: 0,
      bubbleNubSize: 10,
      rootHeight: '500px',
      rootWidth: 'fit-content',

      bubbleFromUserBackground: '#F4F4F4',
      bubbleFromUserBorderColor: '#F4F4F4',
      bubbleFromUserBorderRadius: 4,
      bubbleFromUserBorderWidth: 2,
      bubbleFromUserNubOffset: 0,
      bubbleFromUserNubSize: 10,

      groupTimestamp: 3000,
      showAvatarInGroup: 'status'
}
},

document.getElementById('webchat')
);