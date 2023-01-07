document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_mail;
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').value = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  document.querySelector('#emails-view').innerHTML = '';
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
    console.log(emails);
    emails.forEach(mail => {
      const element = document.createElement('div');
      element.className= "list-group-item";
      if(mailbox === "inbox"){
        element.innerHTML = `<p>From: <span style="font-weight: bold">${mail.sender}</span>    &emsp;<span>${mail.subject}</p>
                            <p>${mail.timestamp}</p>`;
      }else if(mailbox === "sent"){
        element.innerHTML = `<p">To: <span style="font-weight: bold">${mail.recipients[0]}</span>    &emsp;<span>${mail.subject}</p>
                            <p>${mail.timestamp}</p>`;
      }else{
        element.innerHTML = `<p>From: <span style="font-weight: bold">${mail.sender}&ensp; To: <span style="font-weight: bold">${mail.recipients[0]}</span>    &emsp;<span>${mail.subject}</p>
                            <p>${mail.timestamp}</p>`;
      }
      document.querySelector('#emails-view').append(element);
    });
  });
}

function send_mail(event){
  event.preventDefault();

  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients.value,
        subject: subject.value,
        body: body.value
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
    if(result.message){
      load_mailbox('sent');
    }else{
      alert(result.error);
    }
  });
}