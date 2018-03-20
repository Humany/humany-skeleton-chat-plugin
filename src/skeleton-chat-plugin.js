import { Plugin } from '@webprovisions/platform';
import { ChatPlatform } from '@humany/widget-chat';
import MockChatClient from './mock-chat-client';

export default class SkeletonChatPlugin extends Plugin {
  constructor(container, settings) {
    super(container);
    const chatPlatformSettings = {
      adapterClientName: 'skeleton.chat',
      texts: settings.texts,
      disableAutoMessage: true,
    };
    this.chatPlatform = new ChatPlatform(container, chatPlatformSettings);
    this.myChatClient = new MockChatClient();
    this.pendingMessages = {};
  }

  initialize() {
    let agentTyping;
    let queueMessage;

    this.chatPlatform.events.subscribe('chat:connect', (event, data) => {
      queueMessage = this.chatPlatform.chat.createInfoMessage({ html: 'Connecting to chat...' });
      this.chatPlatform.chat.set({ state: 'connecting' });
      this.chatPlatform.commit();
      this.myChatClient.connect(data);
    });

    this.chatPlatform.events.subscribe('chat:disconnect', (event, data) => {
      agentTyping = undefined;
      queueMessage = undefined;
      this.myChatClient.disconnect();
    });

    this.chatPlatform.events.subscribe('chat:user-submit', (event, data) => {
      const message = this.chatPlatform.user.createMessage({ state: 'pending', html: data.text });
      this.pendingMessages[message.id] = message;
      this.chatPlatform.commit();
      this.myChatClient.submit(message);
    });

    this.myChatClient.events.subscribe('message-confirmation', (event, data) => {
      this.pendingMessages[data.message.id].set({ state: 'sent' });
      this.chatPlatform.commit();
      this.pendingMessages[data.message.id] = undefined;
    });

    this.myChatClient.events.subscribe('queue-update', (event, data) => {
      this.chatPlatform.chat.set({ state: 'queuing' });
      if (queueMessage) {
        queueMessage.set({ html: this.chatPlatform.texts.get('positionInQueue', { position: data.position }) });
        this.chatPlatform.commit();
      } else {
        queueMessage = this.chatPlatform.chat.createInfoMessage({ html: this.chatPlatform.texts.get('positionInQueue', { position: data.position }) });
      }
    });

    this.myChatClient.events.subscribe('connected', (event, data) => {
      this.chatPlatform.agent.set(data.agent)
      this.chatPlatform.chat.set({ state: 'ready' });
      if (queueMessage) {
        queueMessage.set({ html: 'Chat successfully connected!' });
        this.chatPlatform.commit();
      } else {
        queueMessage = this.chatPlatform.chat.createInfoMessage({ html: 'Chat successfully connected!' });
      }
    });

    this.myChatClient.events.subscribe('chat-ended', (event, data) => {
      if (this.chatPlatform.chat !== null) {
        this.chatPlatform.disconnect();
      }
    });

    this.myChatClient.events.subscribe('agent-typing', (event, data) => {
      this.chatPlatform.agent.set({ state: 'typing' });
      agentTyping = this.chatPlatform.agent.createMessage({ html: 'Agent is typing...' });
      this.chatPlatform.commit();
    });

    this.myChatClient.events.subscribe('agent-message', (event, data) => {
      if (agentTyping) {
        agentTyping.remove();
        this.chatPlatform.commit();
      }
      this.chatPlatform.agent.set({ state: 'idling' });
      this.chatPlatform.agent.createMessage({ html: data.text });
      this.chatPlatform.commit();
    });
  }
}
