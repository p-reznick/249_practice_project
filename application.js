var Contact = {
  name: undefined,
  email: undefined,
  phone: undefined,
  tags: undefined,
  init: function(name, email, phone, tags) {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.tags = tags;
    return this;
  }
};

function makeNewContact(name, email, phone, tags) {
  return Object.create(Contact).init(name, email, phone, tags);
}

var application = {
  state: {
    contacts: [],
    tags: [{ tagName: "Marketing" },
           { tagName: "Sales" },
           { tagName: "R&D"}],
    currentView: "contacts_view"
  },
  stateKey: '348uf09i23oi09234ljsdf',
  init: function() {
    if (this.getState()) {
      this.state = this.getState();
    }
    this.createTemplates();
    this.displayCurrentView(this.state.currentView);
    this.addListeners();
    this.insertTagsList();
  },
  getState: function() {
    var localState = JSON.parse(localStorage.getItem(this.stateKey));
    if (localState) {
      return localState;
    } else {
      return undefined;
    }
  },
  saveState: function() {
    var stringState = JSON.stringify(this.state);
    localStorage.setItem(this.stateKey, stringState);
  },
  displayCurrentView: function() {
    var selector = '#' + this.state.currentView;
    $(selector).show();
    if (selector === '#contacts_view') {
      this.displayContacts(this.state.contacts);
    }
    this.insertTagsList();
    $('section').hide();
    $(selector).show();
    this.saveState();
  },
  changeCurrentView: function(viewID) {
    this.state.currentView = viewID;
    this.displayCurrentView();
    this.saveState();
  },
  displayContacts: function(displayContacts) {
    if (displayContacts.length === 0) {
      $('#no_contacts').show();
      $('#contacts_list').hide();
    } else {
      var contactsHTML = this.contactsListTemplate({ contacts: displayContacts });
      $('#no_contacts').hide();
      $('#contacts_list ul').remove();
      $('#contacts_list').append(contactsHTML);
      $('#contacts_list').show();
    }
  },
  createTemplates: function() {
    var contactsListScript = $('#contacts_list_template').html();
    $('#contacts_list_template').remove();
    var tagsListScript = $('#tags_list_template').html();
    $('#tags_list_template').remove();

    this.contactsListTemplate = Handlebars.compile(contactsListScript);
    this.tagsListTemplate = Handlebars.compile(tagsListScript);
  },
  addListeners: function() {
    $('.add_contact').on('click', this.handleAddContactDisplay.bind(this));
    $('.cancel_form').on('click', this.handleCancelForm.bind(this));
    $('#add_contact_form').on('submit', this.handleAddContactSubmit.bind(this));
    $(document).on('click', '.delete_contact', this.handleDeleteContact.bind(this));
    $(document).on('click', '.edit_contact', this.handleEditContact.bind(this));
    $('#edit_contact_form').on('submit', this.handleEditContactSubmit.bind(this));
    $('#search_bar').on('keydown keyup blur focus', this.executeSearch.bind(this));
    $(document).on('change', 'nav select', this.executeFilter.bind(this));
    $(document).on('click', '#edit_tags', this.handleEditTags.bind(this));
    $('#edit_tag_list_view form').on('submit', this.handleEditTagsSubmit.bind(this));
  },
  handleAddContactDisplay: function(e) {
    e.preventDefault();
    this.changeCurrentView('add_contact_view');
  },
  handleCancelForm: function(e) {
    e.preventDefault();
    this.changeCurrentView('contacts_view');
  },
  handleAddContactSubmit: function(e) {
    e.preventDefault();

    var $form = $('#add_contact_form');
    var name = $form.find('#name').val();
    var phone = $form.find('#phone').val();
    var email = $form.find('#email').val();
    var tags = $form.find('#tags').val();

    if (this.isUniqueEmail(email)) {
      var newContact = makeNewContact(name, email, phone, tags);
      this.state.contacts.push(newContact);
      this.saveState();
      $form.find('input').val('');
      this.changeCurrentView('contacts_view');
    } else {
      alert("That email is already present.  Please use a unique email.")
    }
  },
  handleDeleteContact: function(e) {
    if (confirm("Are you sure?")) {
      e.preventDefault();
      var email = $(e.target).closest('li').data('id');
      this.state.contacts = this.state.contacts.filter(function(contact) {
        return contact.email !== email;
      });
      this.displayCurrentView();
    }
  },
  handleEditContact: function(e) {
    e.preventDefault();
    var email = $(e.target).closest('li').data('id');
    var contact = this.state.contacts.find(function(contact) {
      return contact.email === email;
    });

    $form = $('#edit_contact_view form');
    $form.find('#email').val(email);
    $form.find('#phone').val(contact.phone);
    $form.find('#name').val(contact.name);

    this.changeCurrentView('edit_contact_view');
  },
  handleEditContactSubmit: function(e) {
    e.preventDefault();

    $form = $('#edit_contact_view form');
    var email = $form.find('#email').val();
    var phone = $form.find('#phone').val();
    var name = $form.find('#name').val();
    var tags = $form.find('#tags').val();

    var contactIndex = undefined;

    this.state.contacts.forEach(function(contact, idx) {
      if (contact.email === email) {
        contactIndex = idx;
      };
    })

    this.state.contacts[contactIndex].name = name;
    this.state.contacts[contactIndex].email = email;
    this.state.contacts[contactIndex].phone = phone;
    this.state.contacts[contactIndex].tags = tags;

    this.changeCurrentView('contacts_view');
  },
  insertTagsList: function() {
    var tagsListHTML = this.tagsListTemplate({ tags: this.state.tags });
    $('.tags_list select').remove();
    $('.tags_list').append(tagsListHTML);
  },
  handleEditTags: function(e) {
    e.preventDefault();
    this.changeCurrentView('edit_tag_list_view');
  },
  handleEditTagsSubmit: function(e) {
    e.preventDefault();
    var newTag = $('#new_tag').val();
    var deleteTags = $('#edit_tag_list_view select').val();

    if (newTag !== '') {
      this.state.tags.push({ tagName: newTag });
    }
    if (deleteTags !== []) {
      this.state.tags = this.state.tags.filter(function(tag) {
        return !(deleteTags.includes(tag.tagName));
      });
    }

    this.changeCurrentView('contacts_view');
  },
  isUniqueEmail(email) {
    return this.state.contacts.every(function(contact) {
      return contact.email !== email;
    });
  },
  executeSearch: function() {
    var query = $('#search_bar').val();
    var queryPattern = new RegExp(query, 'i');

    var matchingContacts = this.state.contacts.filter(function(contact) {
      return contact.name.match(queryPattern);
    });

    this.displayContacts(matchingContacts);
  },
  executeFilter: function() {
    var filterTags = $('nav select').val();

    var matchingContacts = this.state.contacts.filter(function(contact) {
      var match = false;
      contact.tags.forEach(function(tag) {
        if (filterTags.includes(tag)) {
          match = true;
        }
      });
      return match;
    });

    if (filterTags.length === 0) {
      this.displayCurrentView();
    } else {
      this.displayContacts(matchingContacts);
    }
  }
}

$(function() {
  application.init();
});
