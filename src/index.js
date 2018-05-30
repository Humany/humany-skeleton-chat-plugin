import settings from './settings';
import SkeletonChatPlugin from './skeleton-chat-plugin';

const humany = window.Humany;
if (!humany) {
  console.error('No Humany installation is available on the page.');
}

humany.configure(settings.implementationName, (config) => {
  // Register the plugin in the types registry for the current environment:
  config.types.register('@my/skeleton-chat-plugin', SkeletonChatPlugin);
  // Enable the plugin for the specified widget:
  config(settings.widgetName).plugin('@my/skeleton-chat-plugin', {
    texts: {
      chatEnded: 'Chat session ended.',
      positionInQueue: 'Position in queue: {{position}}.',
      queuingForChat: 'Queuing...',
      chatInProgress: 'Chat in progress...',
      endChat: 'End chat',
    }
  });
});