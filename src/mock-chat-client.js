import { EventManager } from '@webprovisions/platform';


export default class MockChatClient {
  constructor() {
    this.events = new EventManager(this);
    this.agent = { name: 'Bob' };
  }
  connect(data) {
    setTimeout(() => {
      this.events.dispatch('queue-update', { position: 3 });
    }, 1000);
    setTimeout(() => {
      this.events.dispatch('queue-update', { position: 2 });
    }, 3000);
    setTimeout(() => {
      this.events.dispatch('queue-update', { position: 1 });
    }, 6000);
    setTimeout(() => {
      this.events.dispatch('connected', { agent: this.agent });
      this.events.dispatch('agent-typing', {});
    }, 10000);
    setTimeout(() => {
      this.events.dispatch('agent-message', { text: 'Hi, my name is Bob! What can I assist you with?' });
    }, 15000);

  }

}