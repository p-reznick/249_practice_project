Contact = {
  name: undefined,
  phoneNumber: undefined,
  emailAddres: undefined,
  contactID: -1,
  init: function(name, phoneNumber, emailAddress, contactID) {
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.emailAddress = emailAddress;
    this.contactID = contactID;
    return this;
  }
};

function makeContactConstructor() {
  var contactID = 0;
  return function(name, phoneNumber, emailAddress) {
    var contact = Object.create(Contact).init(name, phoneNumber, emailAddress, contactID);
    contactID += 1;
    return contact;
  }
}

var makeContact = function(name, phoneNumber, emailAddress) {
  contactID = parseInt(localStorage.getItem('contactManagerLastID'), 10) || 0;
  var contact = Object.create(Contact).init(name, phoneNumber, emailAddress, contactID);
  contactID += 1;
  localStorage.setItem('contactManagerLastID', contactID);
  return contact;
}

var application = {
  contacts: [],
  addListeners: function() {
    $('.add_contact').on('click', this.showCreateContactForm);
    $('#create_contact form').on('submit', this.addContact.bind(this));
    $('#edit_contact form').on('submit', this.editContact.bind(this));
    $('.cancel').on('click', this.cancelFormDisplay.bind(this));
    $(document).on('click', '.edit', this.showEditContactForm.bind(this));
    $(document).on('click', '.delete', this.deleteContact.bind(this));
  },
  init: function() {
    storedContacts = this.getLocalContacts();
    if (storedContacts !== undefined) {
      this.contacts = JSON.parse(storedContacts);
    }
    this.addListeners();
    this.createTemplates();
    this.showFrontPage();
  },
  createTemplates: function() {
    var contactTemplate = $('#contact_template').html();
    var contactListTemplate = $('#contact_list_template').html();

    Handlebars.registerPartial('contactTemplatePartial', contactTemplate);
    this.contactsTemplate = Handlebars.compile(contactListTemplate);
  },
  showCreateContactForm: function(e) {
    if (e) {
      e.preventDefault();
    }
    $('#front_page').hide();
    $('#create_contact').show();
  },
  showEditContactForm: function(e) {
    if (e) {
      e.preventDefault();
    }
    var id = $(e.target).closest('li').data('id');
    var index = this.contacts.findIndex(function(contact) {
      return contact.contactID === id;
    });
    var contact = this.contacts[index];

    $('#front_page').hide();
    $('#edit_contact').show();
    $('#edit_contact #full_name').val(contact.name);
    $('#edit_contact #email').val(contact.emailAddress);
    $('#edit_contact #telephone_number').val(contact.phoneNumber);
    $('#edit_contact form').attr('data-id', id);
  },
  addContact: function(e) {
    e.preventDefault();
    var name = $('#full_name').val();
    var email = $('#email').val();
    var phoneNumber = $('#telephone_number').val();
    this.contacts.push(makeContact(name, phoneNumber, email));
    this.saveContacts();
    this.showFrontPage();
  },
  showFrontPage: function() {
    this.displayContacts();
    $('#front_page').show();
    $('#create_contact').hide();
    $('#edit_contact').hide();
  },
  cancelFormDisplay: function(e) {
    e.preventDefault();
    this.showFrontPage();
  },
  displayContacts: function() {
    if (this.contacts.length > 0) {
      $('#no_contacts').hide();
      var contactsHTML = this.contactsTemplate({ contacts: this.contacts });
      $('#content').html(contactsHTML);
    } else {
      $('#contacts').hide();
      $('#no_contacts').show();
    }
  },
  deleteContact: function(e) {
    e.preventDefault();
    var result = confirm("Are you sure you want to delete this contact?");
    if (result) {
      var id = $(e.target).closest('li').data('id');
      var index = this.contacts.findIndex(function(contact) {
        return contact.contactID === id;
      });

      this.contacts.splice(index, 1);
      this.saveContacts();
      this.showFrontPage();
    }
  },
  saveContacts: function() {
    localStorage.setItem('contactManagerContactList', JSON.stringify(this.contacts));
  },
  getLocalContacts: function() {
    return localStorage.getItem('contactManagerContactList')
  },
  editContact: function(e) {
    e.preventDefault();
    var id = $(e.target).data('id');

    var index = this.contacts.findIndex(function(contact) {
      return contact.contactID === id;
    });

    var name = $('#edit_contact #full_name').val();
    var email = $('#edit_contact #email').val();
    var phoneNumber = $('#edit_contact #telephone_number').val();

    this.contacts[index].name = name;
    this.contacts[index].phoneNumber = phoneNumber;
    this.contacts[index].emailAddress = email;

    this.saveContacts();
    this.showFrontPage();
  }
};

$(function() {
  application.init();
})
