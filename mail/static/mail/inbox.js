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
  document.querySelector('#detail-view').style.display = 'none';
  document.querySelector('#compose_name').innerHTML = "New Email";

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function view_email(id, mailbox){
  document.querySelector('#detail-view').innerHTML = '';
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(mail_details => {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#detail-view').style.display = 'block';
    const email_details = document.createElement('div');
    const buttons = document.createElement('div');
    const email_body = document.createElement('div');
    document.querySelector('#detail-view').append(email_details, buttons, email_body);
    
    //mail details
    email_details.innerHTML = 
      `<p><b>From: </b>${mail_details.sender}</p>
      <p><b>To: </b>${mail_details.recipients[0]}</p>
      <p><b>Subject: </b>${mail_details.subject}</p>
      <p><b>Timestamp: </b>${mail_details.timestamp}</p>`;

    //read
    if(!mail_details.read){
      fetch(`/emails/${mail_details.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }

    //archive/unarchive
    //archive button
    const arch_btn = document.createElement('button');
    arch_btn.className = mail_details.archived ? "btn btn-success" : "btn btn-danger";
    arch_btn.innerHTML = mail_details.archived? "Unarchive" : "Archive";

    //archive button logic
    arch_btn.addEventListener('click', () => {
      fetch(`/emails/${mail_details.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !mail_details.archived
        })
      })
      .then(() => { 
        if(mail_details.archived){
          load_mailbox('archive');
        }else{
          load_mailbox('inbox');
        }
       }) 
    })

    //reply button
    const reply_btn = document.createElement('button');
    reply_btn.className = "btn btn-primary";
    reply_btn.innerHTML = "Reply";
    reply_btn.style.marginRight = "10px"

    //reply button logic
    reply_btn.addEventListener('click', () => {
    compose_email();
    document.querySelector('#compose_name').innerHTML = "Reply";
    // Filling out composition fields
    document.querySelector('#compose-recipients').value = `${mail_details.sender}`;
    let subject = mail_details.subject;
    if(subject.split(' ',1)[0] !== "Re:"){
      subject = "Re: " + subject;
    }
    document.querySelector('#compose-subject').value = `${subject}`;
    document.querySelector('#compose-body').value = `On ${mail_details.timestamp} ${mail_details.recipients[0]} wrote: `;
    })

    buttons.append(reply_btn, arch_btn);

    //buttons display
    if(mailbox === "sent"){
      buttons.style.display = 'none';
    }else if(mailbox === "archive"){
      reply_btn.style.display = 'none';
    }
    
    //email body
    email_body.innerHTML = `<hr><p>${mail_details.body}</p>`
  });  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = '';
  //document.querySelector('#emails-view').value = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
    console.log(emails);
    const mailbox_name = document.createElement('div');
    mailbox_name.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><hr>`;
    document.querySelector('#emails-view').append(mailbox_name);

    emails.forEach(mail => {
      const email_details = document.createElement('div');
      email_details.className = "list-group-item";
      if(mailbox === "inbox"){
        email_details.innerHTML = `<p>From: <span style="font-weight: bold">${mail.sender}</span>    &emsp;<span>${mail.subject}</p>
                            <p>${mail.timestamp}</p>`;
      }else if(mailbox === "sent"){
        email_details.innerHTML = `<p">To: <span style="font-weight: bold">${mail.recipients[0]}</span>    &emsp;<span>${mail.subject}</p>
                            <p>${mail.timestamp}</p>`;
      }else{
        email_details.innerHTML = `<p>From: <span style="font-weight: bold">${mail.sender}</span>&ensp; To: <span style="font-weight: bold">${mail.recipients[0]}</span>    &emsp;<span>${mail.subject}</p>
                            <p>${mail.timestamp}</p>`;
      }
      email_details.style.backgroundColor= mail.read ? 'white' : '#989898';
      email_details.onclick = function(){
        view_email(mail.id, `${mailbox}`);
      }
      document.querySelector('#emails-view').append(email_details);
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