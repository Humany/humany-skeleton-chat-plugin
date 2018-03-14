import { Plugin } from '@webprovisions/platform';
import { ChatPlatform } from '@humany/widget-chat';
import MockChatClient from './mock-chat-client';

export default class SkeletonChatPlugin extends Plugin {
  constructor(container, settings) {
    super(container);
    const chatPlatformSettings = { adapterClientName: 'skeleton.chat', texts: settings.texts };
    this.chatPlatform = new ChatPlatform(container, chatPlatformSettings);
    this.widget.events.subscribe('widget:connect', () => this.chatPlatform.initialize());
    this.myChatClient = new MockChatClient();
  }

  initialize() {
    let agentTyping;
    let queueMessage;

    this.chatPlatform.events.subscribe('chat:connect', (event, data) => {
      this.chatPlatform.chat.createInfoMessage({ text: 'Connecting to chat...' });
      this.chatPlatform.chat.set({ state: 'queuing ' });
      this.chatPlatform.commit();
      this.myChatClient.connect(data);
    });
    this.chatPlatform.events.subscribe('chat:disconnect', (event, data) => {
      console.log(event.type, data);
    });
    this.chatPlatform.events.subscribe('chat:user-submit', (event, data) => {
      console.log(event.type, data);
    });
    this.chatPlatform.events.subscribe('chat:user-typing', (event, data) => {
      console.log(event.type, data);
    });

    this.myChatClient.events.subscribe('queue-update', (event, data) => {
      this.chatPlatform.chat.set({ state: 'queuing ' });
      if (queueMessage) {
        queueMessage.set({ text: this.chatPlatform.texts.get('positionInQueue', { position: data.position }) });
      } else {
        queueMessage = this.chatPlatform.chat.createInfoMessage({ text: this.chatPlatform.texts.get('positionInQueue', { position: data.position }) });
      }
      this.chatPlatform.commit();
    });
    this.myChatClient.events.subscribe('connected', (event, data) => {
      this.chatPlatform.agent.set(data.agent)
      this.chatPlatform.chat.set({ state: 'ready' });
      if (queueMessage) {
        queueMessage.set({ text: 'Chat successfully connected!' });
      } else {
        queueMessage = this.chatPlatform.chat.createInfoMessage({ text: 'Chat successfully connected!' });
      }
      this.chatPlatform.commit();
    });

    this.myChatClient.events.subscribe('agent-typing', (event, data) => {
      this.chatPlatform.agent.set({ state: 'typing' });
      agentTyping = this.chatPlatform.agent.createMessage({ text: 'Agent is typing...' });
      this.chatPlatform.commit();
    });

    this.myChatClient.events.subscribe('agent-message', (event, data) => {
      if (agentTyping) {
        agentTyping.remove();
        this.chatPlatform.commit();
      }
      this.chatPlatform.agent.set({ state: 'idling' });
      this.chatPlatform.agent.createMessage({ text: data.text });
      this.chatPlatform.commit();
    });
  }
}
