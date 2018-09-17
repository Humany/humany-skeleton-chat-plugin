import { EventManager } from '@webprovisions/platform';


export default class MockChatClient {
  constructor() {
    this.events = new EventManager(this);
    this.agent = { name: 'Bob' };
    this.timeouts = [];
    this.responses = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vehicula.',
      'In turpis magna, posuere id est eget, elementum porttitor sem. Mauris viverra.',
      'Nulla orci mi, efficitur sed tincidunt vitae.',
      'Donec turpis nisi, gravida at sapien non, sollicitudin eleifend tortor. In nec mi eget mauris semper vehicula ut sed eros. Nunc non tellus mauris. Praesent.',
      'Nam vitae egestas leo.'
    ];
    this.connect = this.connect.bind(this);
    this.submit = this.submit.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.reconnect = this.reconnect.bind(this);
  }
  connect(name) {
    this.timeouts.push(setTimeout(() => {
      this.events.dispatch('queue-update', { position: 3 });
    }, 2000));
    this.timeouts.push(setTimeout(() => {
      this.events.dispatch('queue-update', { position: 2 });
    }, 4000));
    this.timeouts.push(setTimeout(() => {
      this.events.dispatch('queue-update', { position: 1 });
    }, 6000));
    this.timeouts.push(setTimeout(() => {
      this.connected = true;
      this.events.dispatch('connected', { agent: this.agent });
      this.events.dispatch('agent-typing', {});
    }, 7000));
    this.timeouts.push(setTimeout(() => {
      this.events.dispatch('agent-message', { html: `<p>Hi ${name}!</p><p>My name is Bob, the agent. What can I assist you with?</p>` });
    }, 10000));
  }
  submit(message) {
    this.timeouts.push(setTimeout(() => {
      this.events.dispatch('message-confirmation', { message });
      this.timeouts.push(setTimeout(() => {
        this.events.dispatch('agent-typing', {});
        this.timeouts.push(setTimeout(() => {
          this.events.dispatch('agent-message', { html: `<p>${this.responses[Math.floor(Math.random() * this.responses.length)]}</p>` });
        }, Math.floor(Math.random() * 3000)));
      }, Math.floor(Math.random() * 3000)));
    }, Math.floor(Math.random() * 3000)));
  }
  disconnect() {
    this.events.dispatch('chat-ended', {});
    this.timeouts.forEach(t => clearTimeout(t));
  }
  reconnect() {
    this.connected = true;
    this.events.dispatch('reconnected', { agent: this.agent });
  }
}