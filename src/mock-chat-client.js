import { EventManager } from '@webprovisions/platform';


export default class MockChatClient {
  constructor() {
    this.events = new EventManager(this);
    this.agent = { name: 'Bob' };
    this.timeouts = [];
    this.responseIndex = 0;
    this.responses = [
      'Ok, what kind of car do you have?',
      'Ok, is it an automatic or manual car?',
      'Ok, <a target="_blank" href="https://www.google.com">here</a> you can find all the information you need!',
      "Alright, don't hesitate contacting us again, if you have any else you want help with.",
      'Goodbye!',
    ];
    this.connect = this.connect.bind(this);
    this.submit = this.submit.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }
  connect(data) {
    this.timeouts.push(setTimeout(() => {
      this.events.dispatch('queue-update', { position: 3 });
    }, 1000));
    this.timeouts.push(setTimeout(() => {
      this.events.dispatch('queue-update', { position: 2 });
    }, 3000));
    this.timeouts.push(setTimeout(() => {
      this.events.dispatch('queue-update', { position: 1 });
    }, 6000));
    this.timeouts.push(setTimeout(() => {
      this.events.dispatch('connected', { agent: this.agent });
      this.events.dispatch('agent-typing', {});
    }, 10000));
    this.timeouts.push(setTimeout(() => {
      this.events.dispatch('agent-message', { text: 'Hi, my name is Bob! What can I assist you with?' });
    }, 15000));
  }
  submit(text) {
    if (this.responseIndex !== this.responses.length - 1) {
      this.timeouts.push(setTimeout(() => {
        this.events.dispatch('agent-typing', {});
      }, 2000));
      this.timeouts.push(setTimeout(() => {
        this.events.dispatch('agent-message', { text: this.responses[this.responseIndex] });
        ++this.responseIndex;
      }, 6000));
    } else {
      this.timeouts.push(setTimeout(() => {
        this.events.dispatch('agent-typing', {});
      }, 1000));
      this.timeouts.push(() => {
        this.events.dispatch('agent-message', { text: this.responses[this.responseIndex] });
      }, 5000);
      this.timeouts.push(() => {
        this.disconnect();
      }, 7000);
    }
  }
  disconnect() {
    this.responseIndex = 0;
    this.events.dispatch('chat-ended', {});
    this.timeouts.forEach(t => clearTimeout(t));
  }
}