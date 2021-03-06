import { module, test } from 'qunit';
import DS from 'ember-data';

import { visit, settled, waitFor, pauseTest } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  setupCurrentUser,
  getService,
  text, createIdentity
} from 'emberclear/tests/helpers';

import IdentityService from 'emberclear/src/services/identity/service';
import { sidebar } from 'emberclear/tests/helpers/pages/sidebar';
import { app } from 'emberclear/tests/helpers/pages/app';
import { settings } from 'emberclear/tests/helpers/pages/settings';

module('Acceptance | Sidebar', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);
  setupCurrentUser(hooks);

  hooks.beforeEach(async function() {
    await visit('/chat');
    await sidebar.toggle();
  });

  module('Contacts', function() {
    test('the modals are hidden', function(assert) {
      assert.ok(app.modals.addContact.isHidden(), 'Add Contact is hidden');
    });

    module('the add contact button is clicked', function(hooks) {
      hooks.beforeEach(async function() {
        await sidebar.contacts.clickAdd();
      });

      test('the modal is visible', function(assert) {
        assert.notOk(app.modals.addContact.isHidden());
      });

      module('the modal is closed', function(hooks) {
        hooks.beforeEach(async function() {
          await app.modals.addContact.hide();
        });

        test('the modal is no longer visible', function(assert) {
          assert.ok(app.modals.addContact.isHidden());
        });
      });
    });

    module('the actual list of contacts', function() {

      module('there are 0 contacts', function() {
        test('only the current user is shown', function(assert) {
          const name = getService<IdentityService>('identity')!.name!;
          const content = text(sidebar.contacts.rows()).trim();

          assert.equal(content, name);
        });

        test('offline count does not show', function(assert) {
          assert.notOk(sidebar.contacts.offlineCount());
        });
      });

      module('there is 1 contact', function(hooks) {
        hooks.beforeEach(async function() {
          await createIdentity('first contact');
        });

        test('there are 2 rows of names', function(assert) {
          assert.equal(sidebar.contacts.rows().length, 2);
        });

        test('offline count does not show', function(assert) {
          assert.notOk(sidebar.contacts.offlineCount());
        });

        module('offline contacts are to be hidden', function(hooks) {
          hooks.beforeEach(async function() {
            await visit('/settings');
            await settings.toggleHideOfflineContacts();
            await waitFor(sidebar.selectors.offlineCount);
          });

          test('only the current user is shown', function(assert) {
            const name = getService<IdentityService>('identity')!.name!;
            const content = text(sidebar.contacts.rows());

            assert.ok(content.includes(name), 'current user name is present');
            assert.equal(sidebar.contacts.rows().length, 1, 'one user in the contacts list');
          });

          test('offline count is shown', function(assert) {
            const result = sidebar.contacts.offlineCount()!.textContent;

            assert.ok(result!.match(/1/));
          });
        });
      });

      module('there are 2 contacts', function(hooks) {
        hooks.beforeEach(async function() {
          await createIdentity('first contact');
          await createIdentity('second contact');
        });

        test('there are 3 rows of names', function(assert) {
          assert.equal(sidebar.contacts.rows().length, 3);
        });

        module('offline contacts are to be hidden', function(hooks) {
          hooks.beforeEach(async function() {
            await visit('/settings');
            await settings.toggleHideOfflineContacts();
            await waitFor(sidebar.selectors.offlineCount);
          });

          test('only the current user is shown', function(assert) {
            const name = getService<IdentityService>('identity')!.name!;
            const content = text(sidebar.contacts.rows());

            assert.ok(content.includes(name), 'current user name is present');
            assert.equal(sidebar.contacts.rows().length, 1, 'one user in the contacts list');
          });

          test('offline count is shown', function(assert) {
            const result = sidebar.contacts.offlineCount()!.textContent;

            assert.ok(result!.match(/2/));
          });
        });
      });
    });
  });

  module('Channels', function(hooks) {
    test('the channel form is not visible', function(assert) {
      const form = sidebar.channels.form();

      assert.notOk(form);
    });

    test('there are 0 channels', async function(assert) {
      const store = getService<DS.Store>('store');
      const known = await store.findAll('channel');

      assert.equal(known.length, 0);
    });

    module('the add channel button is clicked', function(hooks) {
      hooks.beforeEach(async function() {
        await sidebar.channels.toggleForm();
      });

      test('the channel form is now visible', function(assert) {
        const form = sidebar.channels.form();

        assert.ok(form);
      });

      module('the cancel button is clicked', function(hooks) {
        hooks.beforeEach(async function() {
          await sidebar.channels.toggleForm();
          await settled();
        });

        test('the channel form is not visible', function(assert) {
          const form = sidebar.channels.form();

          assert.notOk(form);
        });
      });

      module('the channel form is submitted', function(hooks) {
        hooks.beforeEach(async function() {
          await sidebar.channels.fillInput('Vertical Flat Plates');
          await sidebar.channels.submitForm();
          await settled();
        });

        test('the form becomes hidden', function(assert) {
          const form = sidebar.channels.form();

          assert.notOk(form);
        });


        test('a channel is created', function(assert) {
          const store = getService<DS.Store>('store');
          const known = store.peekAll('channel');

          assert.equal(known.length, 1);
          assert.equal(known.firstObject.name, 'Vertical Flat Plates');
        });
      });
    });
  });
});
