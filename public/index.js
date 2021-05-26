const chatForm = document.querySelector('form.chat-input-container');
const chatApp = document.querySelector('main');
const chatMessageListContainer = document.querySelector('.chat-message-list-container');
const chatMessageList = document.querySelector('.chat-message-list');
const joinModal = document.querySelector('.join-modal');
const nameField = document.getElementById('name');
const nameSubmitBtn = document.getElementById('submit-name');
const errorMessage = document.querySelector('.error');
const usersList = document.querySelector('.users-list');
const leaveBtn = document.querySelector('.leave-btn');
const socket = io();
let currentUser;

const validations = {
  existing: 'Username already exists, please choose a different one',
  empty: 'Name cannot be blank'
}

nameSubmitBtn.addEventListener('click', (e) => {
  e.preventDefault();

  if (!nameField.value) {
    updateErrorMessage(validations.empty);
    errorMessage.style.opacity = 1;
    return;
  };
  
  socket.emit('register user', nameField.value);
  socket.on('validation error', type => {
    hide('main');
    show('.join-modal');
    updateErrorMessage(validations[type]);
    errorMessage.style.opacity = 1;
    return;
  });

  hide('.join-modal');
  currentUser = nameField.value;
  nameField.value = '';
  show('main', 'flex');
});

socket.on('register user', activeUsers => {
  const data = {
    user: 'Admin',
    msg: `${activeUsers[activeUsers.length - 1]} has joined`
  };

  renderUserList(activeUsers);
  pushMessage(data);
});

nameField.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') return;

  errorMessage.style.opacity = 0;
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const textInput = e.target.elements[0];
  
  if (!textInput.value) return;
  socket.emit('chat message', textInput.value);
  textInput.value = '';
});

socket.on('chat message', data => pushMessage(data));

const smoothScrollToBottom = () => {
  const latestChat = getLatestChat();
  
  chatMessageListContainer.scrollTo({ top: latestChat.offsetTop, behavior: 'smooth' });
};

leaveBtn.addEventListener('click', (e) => {
  e.preventDefault();
  
  socket.emit('leave chat');
  hide('main');
  show('.join-modal');
});

socket.on('leave chat', (activeUsers, leavingUser) => {
  const data = {
    user: 'Admin',
    msg: `${leavingUser} has left`
  };
  pushMessage(data);
  renderUserList(activeUsers);
});

const renderUserList = (currentUsers=[]) => {
  if (currentUsers.length === 0) return;

  usersList.replaceChildren();
  let nameDiv;

  currentUsers.forEach((user) => {
    nameDiv = document.createElement('div');
    nameDiv.classList.add('username');
    nameDiv.setAttribute('data-username', user);
    nameDiv.innerText = user;
    usersList.appendChild(nameDiv);
  });
};

const pushMessage = (data) => {
  const chatBubbleContainer = createChatBubbleContainer(data.user);
  chatBubbleContainer.firstElementChild.innerText = data.msg;

  chatMessageList.appendChild(chatBubbleContainer);
  smoothScrollToBottom();
};

const getNameFromList = name => document.querySelector(`[data-username="${name}"]`);

const createChatBubbleContainer = (sender) => {
  const div = document.createElement('div');
  const senderClass = getSenderClass(sender);
  div.classList.add('chat-bubble-container', senderClass);
  const senderDisplay = sender === currentUser ? 'You' : sender;
  div.innerHTML = `
    <div class="chat-bubble"></div>
    <small>
      <span class="sender">${senderDisplay}</span>
      <span class="time">${new Date().toLocaleTimeString()}</span>
    </small>
  `

  return div;
};

const getSenderClass = (sender) => {
  if (sender === currentUser) return 'me';
  if (sender === 'Admin') return 'admin';
  return 'other-user';
};

const getLatestChat = () => {
  const chatBubbles = document.querySelectorAll('.chat-bubble-container');
  const latestChat = chatBubbles[chatBubbles.length - 1];

  return latestChat;
};

const updateErrorMessage = (err) => errorMessage.innerText = err;

const show = (selector, display='block') => document.querySelector(selector).style.display = display;
const hide = selector => document.querySelector(selector).style.display = 'none';