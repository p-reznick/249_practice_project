Contact = {
  name: undefined,
  phoneNumber: undefined,
  emailAddres: undefined,
  contactID: -1,
  tags: [],
  init: function(name, phoneNumber, emailAddress, tags, contactID) {
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.emailAddress = emailAddress;
    this.tags = tags;
    this.contactID = contactID;
    return this;
  }
};

var makeContact = function(name, phoneNumber, emailAddress, tags) {
  contactID = parseInt(localStorage.getItem('contactManagerLastID'), 10) || 0;
  var contact = Object.create(Contact).init(name, phoneNumber, emailAddress, tags, contactID);
  contactID += 1;
  localStorage.setItem('contactManagerLastID', contactID);
  return contact;
}

var application = {
  contacts: [],
  tags: JSON.parse(localStorage.getItem('contactManagerTagList')) || [],
  addListeners: function() {
    $('.add_contact').on('click', this.showCreateContactForm.bind(this));
    $('#create_contact form').on('submit', this.addContact.bind(this));
    $('#edit_contact form').on('submit', this.editContact.bind(this));
    $('.cancel').on('click', this.cancelFormDisplay.bind(this));
    $('#search').on('keyup', this.executeSearch.bind(this));
    $('nav').on('change blur focus', 'select', this.executeFilter.bind(this));
    $('nav').on('click', '#edit_tags', this.showEditTagsForm.bind(this));
    $('#submit_tag_edits').closest('form').on('submit', this.editTags.bind(this));
    $(document).on('click', '.edit', this.showEditContactForm.bind(this));
    $(document).on('click', '.delete', this.deleteContact.bind(this));
  },
  init: function() {
    storedContacts = this.getLocalContacts();
    if (storedContacts !== undefined) {
      this.contacts = JSON.parse(storedContacts);
    }
    this.createTemplates();
    this.showFrontPage();
    this.addListeners();
  },
  createTemplates: function() {
    var contactTemplate = $('#contact_template').html();
    var contactListTemplate = $('#contact_list_template').html();
    var tagsListTemplate = $('#tags_list_template').html();
    var filterButtonsTemplate = $('#filter_buttons').html();

    Handlebars.registerPartial('contactTemplatePartial', contactTemplate);
    this.filterButtonsTemplate = Handlebars.compile(filterButtonsTemplate);
    this.contactsTemplate = Handlebars.compile(contactListTemplate);
    this.tagsListTemplate = Handlebars.compile(tagsListTemplate);
  },
  showCreateContactForm: function(e) {
    if (e) {
      e.preventDefault();
    }

    var tagsListHTML = this.tagsListTemplate({ tags: this.tags });
    $('#tag_list').remove();
    $('#create_contact ul').append(tagsListHTML);

    $('#create_contact input').val('');

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

    var tagsListHTML = this.tagsListTemplate({ tags: this.tags });
    $('#tag_list').remove();
    $('#edit_contact ul').append(tagsListHTML);

    $('#front_page').hide();
    $('#edit_contact').show();
    $('#edit_contact #full_name').val(contact.name);
    $('#edit_contact #email').val(contact.emailAddress);
    $('#edit_contact #telephone_number').val(contact.phoneNumber);
    $('#edit_contact #tag_list').val(contact.tags);
    $('#edit_contact form').attr('data-id', id);
  },
  addContact: function(e) {
    e.preventDefault();
    var name = $('#create_contact #full_name').val();
    var email = $('#create_contact #email').val();
    var phoneNumber = $('#create_contact #telephone_number').val();
    var tags = $('#create_contact #tag').val();
    this.contacts.push(makeContact(name, phoneNumber, email, tags));
    this.saveContacts();
    this.showFrontPage();
  },
  showFrontPage: function() {
    this.displayContacts(this.contacts);

    var tagsListHTML = this.tagsListTemplate({ tags: this.tags });
    var filterButtonsHTML = this.filterButtonsTemplate();

    $('#tag_list').remove();
    $('nav ul').append(tagsListHTML);
    $('nav #tag_list form').append(filterButtonsHTML);

    $('#front_page').show();
    $('#edit_tag_list').hide();
    $('#create_contact').hide();
    $('#edit_contact').hide();
  },
  cancelFormDisplay: function(e) {
    e.preventDefault();
    this.showFrontPage();
  },
  displayContacts: function(list) {
    if (list.length > 0) {
      $('#no_contacts').hide();
      var contactsHTML = this.contactsTemplate({ contacts: list });
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
  saveTags: function() {
    localStorage.setItem('contactManagerTagList', JSON.stringify(this.tags));
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
    var tags = $('#edit_contact #tag').val();

    this.contacts[index].name = name;
    this.contacts[index].phoneNumber = phoneNumber;
    this.contacts[index].emailAddress = email;
    this.contacts[index].tags = tags;

    this.saveContacts();
    this.showFrontPage();
  },
  executeSearch: function() {
    var query = $('#search').val();

    if (query !== '') {
      var regExp = new RegExp(query, 'i');

      var matchingContacts = this.contacts.filter(function(contact) {
        return contact.name.match(regExp);
      });

      this.displayContacts(matchingContacts);
    } else {
      this.displayContacts(this.contacts);
    }
  },
  executeFilter: function(e) {
    var filters = $('nav select').val();

    if (filters.length > 0) {
      var matchingContacts = this.contacts.filter(function(contact) {
        var match = false;
        filters.forEach(function(tag) {
          if (contact.tags.includes(tag)) {
            match = true;
          };
        });
        return match;
      });

      this.displayContacts(matchingContacts);
    } else {
      this.displayContacts(this.contacts);
    }
  },
  editTags: function(e) {
    e.preventDefault();
    var newTag = $('#new_tag').val();
    var deleteTags = $('#edit_tag_list #tag').val();

    if (this.tags.indexOf(newTag) === -1 && newTag !== '') {
      this.tags.push({ tagName: newTag });
    }

    this.tags = this.tags.filter(function(tagObj) {
      return deleteTags.indexOf(tagObj.tagName) === -1;
    });

    this.saveTags();
    this.showFrontPage();
  },
  showEditTagsForm() {
    var tagsListHTML = this.tagsListTemplate({ tags: this.tags });

    $('#front_page').hide();
    $('#edit_tag_list').show();
    $('#edit_tag_list #tag_list').remove();
    $('#edit_tag_list ul').append(tagsListHTML);
  }
};

$(function() {
  application.init();
})
