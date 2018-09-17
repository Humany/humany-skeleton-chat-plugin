import { Plugin } from '@webprovisions/platform';
import { ChatPlatform } from '@humany/widget-chat';
import MockChatClient from './mock-chat-client';


export default class SkeletonChatPlugin extends Plugin {
  constructor(container, settings) {
    super(container);
    this.myChatClient = new MockChatClient();

    const chatPlatformSettings = {
      adapterClientName: 'skeleton.chat',
      disableAutoMessage: true,
      enableFiles: true,
      texts: settings.texts
    }
    this.chatPlatform = new ChatPlatform(container, chatPlatformSettings);

    this.pendingMessages = {};
    this.agentTyping = undefined;
    this.queueMessage = undefined;

    this.chatPlatform.events.subscribe('chat:connect', (event, { formData }) => {
      this.queueMessage = this.chatPlatform.chat.createInfoMessage({ html: 'Connecting to chat...' });
      this.chatPlatform.chat.set({ state: 'connecting' });
      this.chatPlatform.commit();

      const name = `${formData['first-name']} ${formData['last-name']}`
      this.myChatClient.connect(name);

      this.container
        .getAsync('storage')
        .then((storage) => {
          storage.setItem('chat-in-session', true);
        })
    });

    this.chatPlatform.events.subscribe('chat:disconnect', (event, data) => {
      this.agentTyping = undefined;
      this.queueMessage = undefined;
      this.myChatClient.disconnect();

      this.container
        .getAsync('storage')
        .then((storage) => {
          storage.removeItem('chat-in-session');
        })
    });

    this.chatPlatform.events.subscribe('chat:user-typing', (event, data) => {
      console.log('user typing:', data);
    });

    this.chatPlatform.events.subscribe('chat:user-submit', (event, data) => {
      data.files && console.log('FileList: ', data.files);
      const message = this.chatPlatform.user.createMessage({ state: 'pending', html: data.html || data.text });
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
      if (this.queueMessage) {
        this.queueMessage.set({ html: this.chatPlatform.texts.get('positionInQueue', { position: data.position }) });
        this.chatPlatform.commit();
      } else {
        this.queueMessage = this.chatPlatform.chat.createInfoMessage({ html: this.chatPlatform.texts.get('positionInQueue', { position: data.position }) });
      }
    });

    this.myChatClient.events.subscribe('connected', (event, data) => {
      this.chatPlatform.agent.set(data.agent)
      this.chatPlatform.chat.set({ state: 'ready' });
      if (this.queueMessage) {
        this.queueMessage.set({ html: 'Chat successfully connected!' });
      } else {
        this.queueMessage = this.chatPlatform.chat.createInfoMessage({ html: 'Chat successfully connected!' });
      }
      this.chatPlatform.commit();
    });

    this.myChatClient.events.subscribe('reconnected', (event, data) => {
      this.chatPlatform
        .reconnect()
        .then((connected) => {
          if (connected) {
            this.chatPlatform.agent.set(data.agent)
            this.chatPlatform.chat.set({ state: 'ready' });
            this.chatPlatform.chat.createInfoMessage({ html: 'Chat successfully reconnected!' });
            this.chatPlatform.commit();
          } else {
            console.warn('Something went wrong when reconnecting to Chat Platform');
          }
        });
    });

    this.myChatClient.events.subscribe('chat-ended', (event, data) => {
      if (this.chatPlatform.chat !== null) {
        this.chatPlatform.disconnect();
      }
    });

    this.myChatClient.events.subscribe('agent-typing', (event, data) => {
      this.chatPlatform.agent.set({ state: 'typing' });
      this.agentTyping = this.chatPlatform.chat.createInfoMessage({ html: 'Agent is typing...' });
      this.chatPlatform.commit();
    });

    this.myChatClient.events.subscribe('agent-message', (event, data) => {
      if (this.agentTyping) {
        this.agentTyping.remove();
        this.chatPlatform.commit();
      }
      this.chatPlatform.agent.set({ state: 'idling' });
      this.chatPlatform.agent.createMessage({ html: data.html });
      this.chatPlatform.commit();
    });

    const widgetStartedEventSub
      = this.widget.events.subscribe('widget:started', () => {
        this.container
          .getAsync('storage')
          .then((storage) => {
            const chatInSession = storage.getItem('chat-in-session');
            if (chatInSession) {
              widgetStartedEventSub();
              this.myChatClient.reconnect();
            }
          })
      });
  }
}