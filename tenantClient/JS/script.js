let arrow = document.querySelectorAll(".arrow");
for (var i = 0; i < arrow.length; i++) {
  arrow[i].addEventListener("click", (e)=>{
    let arrowParent = e.target.parentElement.parentElement;
    arrowParent.classList.toggle("showMenu");
  });
}


const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

// Load saved theme from localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.classList.add(savedTheme);
    updateButtonText(savedTheme);
}

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    const theme = body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
    localStorage.setItem('theme', theme);
    
    updateButtonText(theme);
});

function updateButtonText(theme) {
    if (theme === 'dark-mode') {
        toggleButton.textContent = 'Light Mode';
    } else {
        toggleButton.textContent = 'Dark Mode';
    }
}



let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".toggle");
console.log(sidebarBtn);
sidebarBtn.addEventListener("click", ()=>{
  sidebar.classList.toggle("close");
});

function loadContent(url) {
  const contentButton = document.querySelector('.sidebar');
  contentButton.style.display = 'none';

  fetch(url)
    .then(response => response.text())
    .then(data => {
      const contentArea = document.getElementById('content');
      contentArea.innerHTML = data;

      if (url.includes('Pages/Whatsapp.html')) {
        initWhatsAppContacts();
      }
      if (url.includes('Pages/Instagram.html')) {
        initInstagramContacts();
      }
      if (url.includes('Pages/Messenger.html')) {
        initMessengerContacts();
      }
      if (url.includes('Pages/ChatBot.html')) {
        initChatBotContacts();
      }
      if (url.includes('Pages/Youtube.html')) {
        initYoutubeContacts();
      }
      if (url.includes('Pages/Orders.html')) {
        initOrdersContacts();
      }
    })
    .catch(error => console.error(error));
}

function initWhatsAppContacts() {
  const backgroundtoggleButton = document.getElementById('theme-toggle');
  const body = document.body;
  
  // Load saved theme from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
      body.classList.add(savedTheme);
      updateButtonText(savedTheme);
  }
  
  backgroundtoggleButton.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      
      const theme = body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
      localStorage.setItem('theme', theme);
      
      updateButtonText(theme);
  });
  
  function updateButtonText(theme) {
      if (theme === 'dark-mode') {
          backgroundtoggleButton.textContent = 'Light';
      } else {
          backgroundtoggleButton.textContent = 'Dark';
      }
  }
  
  const contacts = [
    { name: 'John Doe' },
    { name: 'Jane Smith' },
    { name: 'Alice Johnson' },
    { name: 'Bob Brown' },
    { name: 'Charlie Davis' },
    { name: 'John Doe' },
    { name: 'Jane Smith' },
    { name: 'Alice Johnson' },
    { name: 'Bob Brown' },
    { name: 'Charlie Davis' },
    { name: 'John Doe' },
    { name: 'Jane Smith' },
    { name: 'Alice Johnson' },
    { name: 'Bob Brown' },
    { name: 'Charlie Davis' },
  ];

  const contactList = document.getElementById('contact-list');
  const searchBar = document.getElementById('search-bar');

  function renderContacts(filteredContacts) {
    contactList.innerHTML = '';
    filteredContacts.forEach(contact => {
      const li = document.createElement('li');

      const profileContent = document.createElement('div');
      profileContent.className = 'profile-Content';
      
      const profileImage = document.createElement('div');
      profileImage.className = 'profile-image';
      profileImage.textContent = contact.name.charAt(0);

      const recentMessage = document.createElement('div');
      recentMessage.className = 'recent-Message';
      recentMessage.textContent = 'last-message';

      profileContent.appendChild(document.createTextNode(contact.name));
      profileContent.appendChild(recentMessage);
      
      li.appendChild(profileImage);
      li.appendChild(profileContent);

      li.addEventListener('click', () => openChat(contact.name));
      contactList.appendChild(li);
    });
  }

  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        sendMessage();
        event.preventDefault(); 
      }
    });
  }

  renderContacts(contacts);

  searchBar.addEventListener('input', (event) => {
    const searchText = event.target.value.toLowerCase();
    const filteredContacts = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchText)
    );
    renderContacts(filteredContacts);
  });

  const profileName = document.getElementById('name');
    const section3part2 = document.getElementById('section3part2');
    const closeBtn = document.getElementById("close-btn");

    profileName.addEventListener('click', function() {
        section3part2.style.width = "51vw";
    });
    closeBtn.addEventListener("click", function() {
      section3part2.style.width = "0";
    });

  const recordBtn = document.getElementById('record-btn');
  const stopBtn = document.getElementById('stop-btn');
  const conversationArea = document.getElementById('conversation');
  let mediaRecorder;
  let audioChunks = [];
  let fileElement;
  function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        mediaRecorder.addEventListener('dataavailable', event => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = document.createElement('audio');
          audio.controls = true;
          audio.src = audioUrl;

          const audioContainer = document.createElement('div');
          audioContainer.className = 'voice-message';
          audioContainer.appendChild(audio);

          fileElement=audioContainer;
          if (fileElement) {
            const timestampSpan = document.createElement('span');
            timestampSpan.className = 'timestamp';
            const now = new Date();
            timestampSpan.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            fileElement.appendChild(timestampSpan);
            conversationArea.appendChild(fileElement);
            conversationArea.scrollTop = conversationArea.scrollHeight;
            setTimeout(() => {
              receiveMessage('This is a reply message');
          }, 1000);
          }
          audioChunks = [];
        });
        recordBtn.style.display = 'none';
        stopBtn.style.display = 'inline';
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
      });
  }
  function stopRecording() {
    mediaRecorder.stop();
    recordBtn.style.display = 'inline';
    stopBtn.style.display = 'none';
  }
  recordBtn.addEventListener('click', startRecording);
  stopBtn.addEventListener('click', stopRecording);



  const fileInput = document.getElementById('file-input');
  const cameraIcon = document.getElementById('camera-icon');
  cameraIcon.addEventListener('click', () => {
    fileInput.click(); 
  });

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type;
      let fileElement;

      if (fileType.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        img.className = 'uploaded-image';
        fileElement = img;
      } else if (fileType.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        video.className = 'uploaded-video';
        fileElement = video;
      } 
      else if (fileType.endsWith('pdf') || fileType.endsWith('doc') || fileType.endsWith('docx')) {
          const file = event.target.files[0];
          if (file) {
            const fileURL = URL.createObjectURL(file);
            const conversation = document.getElementById('conversation');
            
            if (file.type.match('application/pdf') || file.name.match(/\.(doc|docx)$/i)) {
              const docMessage = document.createElement('div');
              docMessage.className = 'document-message';
        
              const docIcon = document.createElement('div');
              docIcon.className = 'document-icon';
              docIcon.textContent = '📄';
        
              const docDetails = document.createElement('div');
              docDetails.className = 'document-details';
        
              const docFilename = document.createElement('div');
              docFilename.className = 'document-filename';
              docFilename.textContent = file.name;
        
              const docFilesize = document.createElement('div');
              docFilesize.className = 'document-filesize';
              docFilesize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
        
              const downloadLink = document.createElement('a');
              downloadLink.className = 'document-download';
              downloadLink.href = fileURL;
              downloadLink.textContent = 'Download';
              downloadLink.download = file.name;
        
              docDetails.appendChild(docFilename);
              docDetails.appendChild(docFilesize);
              docDetails.appendChild(downloadLink);
        
              docMessage.appendChild(docIcon);
              docMessage.appendChild(docDetails);
        
              conversation.appendChild(docMessage);
              fileElement=docMessage;
            } 
          }
      }

      if (fileElement) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message sent';
        messageDiv.appendChild(fileElement);

        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'timestamp';
        const now = new Date();
        timestampSpan.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.appendChild(timestampSpan);

        conversationArea.appendChild(messageDiv);
        conversationArea.scrollTop = conversationArea.scrollHeight;
        setTimeout(() => {
          receiveMessage('This is a reply message');
      }, 1000);
      }
    }
  });

  function sendMessage() {
    const inputField = document.getElementById('chat-input');
    const messageText = inputField.value.trim();
    if (messageText === '') return;
  
    const conversation = document.getElementById('conversation');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent';
    messageDiv.id='data-id'; 
  
    const contentSpan = document.createElement('span');
    contentSpan.className = 'content';
    contentSpan.textContent = messageText;
  
    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    const now = new Date();
    timestampSpan.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // const tickIcon = document.createElement('i');
    // tickIcon.className = 'tick-icon bx bx-check';
  
    messageDiv.appendChild(contentSpan);
    messageDiv.appendChild(timestampSpan);
    // messageDiv.appendChild(tickIcon);

    conversation.appendChild(messageDiv);
    conversation.scrollTop = conversation.scrollHeight;

    inputField.value = '';

    
    // Play tick sound
    // const tickSound = document.getElementById('tick-sound');
    // tickSound.play();
    setTimeout(() => {
      receiveMessage('This is a reply message');
  }, 1000);

  // createMessage(messageDiv);

  conversation.scrollTop = conversation.scrollHeight;
  const messageId = `message-${Date.now()}`; 
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', isSentByUser ? 'sent' : 'received');
  messageElement.dataset.messageId = messageId;

  messageElement.innerHTML = `
    <div class="content">${content}</div>
    <div class="timestamp">12:34 PM</div>
  `;
  return messageElement;
  }

  function receiveMessage(messageText) {
    const conversation = document.getElementById('conversation');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message received';
    messageDiv.id='data-id';
  
    const contentSpan = document.createElement('span');
    contentSpan.className = 'content';
    contentSpan.textContent = messageText;
  
    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    timestampSpan.textContent = formatTimestamp(new Date());
  
    messageDiv.appendChild(contentSpan);
    messageDiv.appendChild(timestampSpan);
  
    conversation.appendChild(messageDiv);
    conversation.scrollTop = conversation.scrollHeight;

    // createMessage(messageDiv);

    const messageId = `message-${Date.now()}`; 
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', isSentByUser ? 'sent' : 'received');
  messageElement.dataset.messageId = messageId;

  messageElement.innerHTML = `
    <div class="content">${content}</div>
    <div class="timestamp">12:34 PM</div>
  `;
  return messageElement;
  }
  document.getElementById('clear-chat-btn').addEventListener('click', () => {
    const conversation = document.getElementById('conversation');
    conversation.innerHTML = ''; // Clears all messages in the conversation area
});



let selectedMessages = [];

// Function to toggle selection of a message
function toggleSelection(event) {
  const message = event.currentTarget;
  const messageId = message.dataset.messageId;

  if (selectedMessages.includes(messageId)) {
    message.classList.remove('selected');
    selectedMessages = selectedMessages.filter(id => id !== messageId);
  } else {
    message.classList.add('selected');
    selectedMessages.push(messageId);
  }
  toggleDeleteOptions();
}


function toggleDeleteOptions() {
  const deleteOptions = document.getElementById('delete-options');
  if (selectedMessages.length > 0) {
    deleteOptions.style.display = 'flex';
  } else {
    deleteOptions.style.display = 'none';
  }
}

// Delete selected messages
function deleteMessages(deleteForEveryone) {
  selectedMessages.forEach(messageId => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      if (deleteForEveryone) {
        // Logic for deleting message for everyone (e.g., send request to server)
        messageElement.remove();
      } else {
        // Logic for deleting message only for the current user
        messageElement.remove();
      }
    }
  });
  selectedMessages = [];
  toggleDeleteOptions();
}

// Attach event listeners to dynamically generated messages
conversationArea.addEventListener('click', (event) => {
  if (event.target.closest('.message')) {
    toggleSelection(event);
  }
});

// Add event listeners to delete buttons
document.getElementById('delete-for-me').addEventListener('click', () => deleteMessages(false));
document.getElementById('delete-for-everyone').addEventListener('click', () => deleteMessages(true));

function createMessage(content, isSentByUser) {
  const messageId = `message-${Date.now()}`; 
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', isSentByUser ? 'sent' : 'received');
  messageElement.dataset.messageId = messageId;

  messageElement.innerHTML = `
    <div class="content">${content}</div>
    <div class="timestamp">12:34 PM</div>
  `;
  return messageElement;
}

    const messagesContainer = document.querySelector('.conversation');
    const deleteForMeBtn = document.getElementById('delete-for-me');
    const deleteForEveryoneBtn = document.getElementById('delete-for-everyone');

    // Toggle selection of messages
    messagesContainer.addEventListener('click', function(event) {
        const messageElement = event.target.closest('.message');
        if (messageElement) {
            messageElement.classList.toggle('selected-message');
        }
    });

    // Delete selected messages for me
    deleteForMeBtn.addEventListener('click', function() {
        const selectedMessages = document.querySelectorAll('.message.selected-message');
        selectedMessages.forEach(function(message) {
            message.remove();
        });
        // hideDeleteButtons();
    });

    // Delete selected messages for everyone
    deleteForEveryoneBtn.addEventListener('click', function() {
        const selectedMessages = document.querySelectorAll('.message.selected-message');
        selectedMessages.forEach(function(message) {
            message.remove();
        });
        // hideDeleteButtons();
    });

    // Hide delete buttons after deletion
    function hideDeleteButtons() {
        deleteForMeBtn.style.display = 'none';
        deleteForEveryoneBtn.style.display = 'none';
    }

};
function formatTimestamp(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + ampm;
}

function initOrdersContacts() {
  const contacts = [
    { name: 'vijay' },
    { name: 'ajith' },
    { name: 'kamal' },
    { name: 'rajini' },
    { name: 'suriya' },
    { name: 'karthi' },
    { name: 'vijay' },
    { name: 'ajith' },
    { name: 'kamal' },
    { name: 'rajini' },
    { name: 'suriya' },
    { name: 'karthi' },
    { name: 'vijay' },
    { name: 'ajith' },
    { name: 'kamal' },
    { name: 'rajini' },
    { name: 'suriya' },
    { name: 'karthi' },
  ];

const contactList = document.getElementById('contact-list');
  const searchBar = document.getElementById('search-bar');

  function renderContacts(filteredContacts) {
    contactList.innerHTML = '';
    filteredContacts.forEach(contact => {
      const li = document.createElement('li');
      li.textContent = contact.name;
      li.addEventListener('click', () => openChat(contact.name));
      contactList.appendChild(li);
    });
  }

  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        sendMessage();
        event.preventDefault(); 
      }
    });
  }

  renderContacts(contacts);

  searchBar.addEventListener('input', (event) => {
    const searchText = event.target.value.toLowerCase();
    const filteredContacts = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchText)
    );
    renderContacts(filteredContacts);
  });
};

function initInstagramContacts() {
  const contacts = [
    { name: 'vijay' },
    { name: 'ajith' },
    { name: 'kamal' },
    { name: 'rajini' },
    { name: 'suriya' },
    { name: 'karthi' },
    { name: 'vijay' },
    { name: 'ajith' },
    { name: 'kamal' },
    { name: 'rajini' },
    { name: 'suriya' },
    { name: 'karthi' },
    { name: 'vijay' },
    { name: 'ajith' },
    { name: 'kamal' },
    { name: 'rajini' },
    { name: 'suriya' },
    { name: 'karthi' },
  ];

const contactList = document.getElementById('contact-list');
  const searchBar = document.getElementById('search-bar');

  function renderContacts(filteredContacts) {
    contactList.innerHTML = '';
    filteredContacts.forEach(contact => {
      const li = document.createElement('li');
      li.textContent = contact.name;
      li.addEventListener('click', () => openChat(contact.name));
      contactList.appendChild(li);
    });
  }

  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        sendMessage();
        event.preventDefault(); 
      }
    });
  }
  
  renderContacts(contacts);

  searchBar.addEventListener('input', (event) => {
    const searchText = event.target.value.toLowerCase();
    const filteredContacts = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchText)
    );
    renderContacts(filteredContacts);
  });
};

function initMessengerContacts() {
  const contacts = [
    { name: 'vijay' },
    { name: 'ajith' },
    { name: 'kamal' },
    { name: 'rajini' },
    { name: 'suriya' },
    { name: 'karthi' },
    { name: 'vijay' },
    { name: 'ajith' },
    { name: 'kamal' },
    { name: 'rajini' },
    { name: 'suriya' },
    { name: 'karthi' },
    { name: 'vijay' },
    { name: 'ajith' },
    { name: 'kamal' },
    { name: 'rajini' },
    { name: 'suriya' },
    { name: 'karthi' },
  ];

const contactList = document.getElementById('contact-list');
  const searchBar = document.getElementById('search-bar');

  function renderContacts(filteredContacts) {
    contactList.innerHTML = '';
    filteredContacts.forEach(contact => {
      const li = document.createElement('li');
      li.textContent = contact.name;
      li.addEventListener('click', () => openChat(contact.name));
      contactList.appendChild(li);
    });
  }

  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        sendMessage();
        event.preventDefault(); 
      }
    });
  }
  
  renderContacts(contacts);

  searchBar.addEventListener('input', (event) => {
    const searchText = event.target.value.toLowerCase();
    const filteredContacts = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchText)
    );
    renderContacts(filteredContacts);
  });
};

function initChatBotContacts() {
  const contacts = [
    { name: 'vijay' },
    { name: 'ajith' },
    { name: 'kamal' },
    { name: 'rajini' },
    { name: 'suriya' },
    { name: 'karthi' },
    { name: 'vijay' },
    { name: 'ajith' },
    { name: 'kamal' },
    { name: 'rajini' },
    { name: 'suriya' },
    { name: 'karthi' },
    { name: 'vijay' },
    { name: 'ajith' },
    { name: 'kamal' },
    { name: 'rajini' },
    { name: 'suriya' },
    { name: 'karthi' },
  ];

const contactList = document.getElementById('contact-list');
  const searchBar = document.getElementById('search-bar');

  function renderContacts(filteredContacts) {
    contactList.innerHTML = '';
    filteredContacts.forEach(contact => {
      const li = document.createElement('li');
      li.textContent = contact.name;
      li.addEventListener('click', () => openChat(contact.name));
      contactList.appendChild(li);
    });
  }

  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        sendMessage();
        event.preventDefault(); 
      }
    });
  }

  renderContacts(contacts);

  searchBar.addEventListener('input', (event) => {
    const searchText = event.target.value.toLowerCase();
    const filteredContacts = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchText)
    );
    renderContacts(filteredContacts);
  });
};

function initYoutubeContacts() {
  const contacts = [
    { name: 'Comment 1' },
    { name: 'Comment 2' },
    { name: 'Comment 3' },
  ];

  const contactList = document.getElementById('comments-list');
  const searchBar = document.getElementById('search-bar');

  function renderContacts(filteredContacts) {
    contactList.innerHTML = '';
    filteredContacts.forEach(contact => {
      const li = document.createElement('li');
      li.textContent = contact.name;
      contactList.appendChild(li);
    });
  }

  renderContacts(contacts);

  searchBar.addEventListener('input', (event) => {
    const searchText = event.target.value.toLowerCase();
    const filteredContacts = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchText)
    );
    renderContacts(filteredContacts);
  });
};


function openChat(contactName) {
  const defaultMessage = document.getElementById('default-message');
  const contactResponse = document.getElementById('contact-response');
  const profileName = document.getElementById('profile-name');
  const profileName2 = document.getElementById('profile-name2');

  if (defaultMessage) {
    defaultMessage.style.display = 'none';
  }
  if (contactResponse) {
    setTimeout(() => {
      contactResponse.style.display = 'flex';
      if (profileName) {
        profileName.textContent = contactName;
      }
      if (profileName2) {
        profileName2.textContent = contactName;
      }
    }, 500);
  }

  const conversation = document.getElementById('conversation');
  if (conversation) {
    conversation.innerHTML = '';
  }
}

function sendMessage() {
  const inputElement = document.getElementById('chat-input');
  const messageText = inputElement.value;
  if (messageText.trim() === '') return;

  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'sent');
  messageElement.innerHTML = `<div class="content">${messageText}</div>`;

  document.getElementById('conversation').appendChild(messageElement);
  inputElement.value = '';

  setTimeout(() => {
      receiveMessage('This is a reply message');
  }, 1000);
}

function receiveMessage(messageText) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'received');
  messageElement.innerHTML = `<div class="content">${messageText}</div>`;

  document.getElementById('conversation').appendChild(messageElement);
}

function redirectToMainPage() {
  window.location.replace("index.html");
}










