# humany-skeleton-chat-plugin
This skeleton sets up a standard chat plugin for Humany using the Humany Chat Platform.

For documentation on how to use the platform: [`@humany/widget-chat`](https://www.npmjs.com/package/@humany/widget-chat).

## Building the code
1. Ensure NodeJS and Git is installed.
2. Clone or fork this repository.
3. From the root folder, execute the following command to install the dependencies:
```
npm install
```
4. From the root folder, execute one of the following commands to generate the bundle.
```
npm run build
```
```
npm run build-dev
```
5. To watch the plugin in action
```
npm run start
```

This will launch your browser and redirect you to a simple server where you can see your plugin in action.


## Registering the plugin
Include the generated bundle (located in the `/dist` folder) after the default Humany embed script, e.g.:
```html
<!-- Start Humany - implementation: "webprovisions" [webprovisions] -->
<script>
  (function(n,t,i,r,u,f,e){for(var o,s=/[?&]{1}(humany[^=]*)=([^&#]*)/g;o=s.exec(n.location.search);)i+=(i.indexOf("?")>-1?"&":"?")+o[1]+"="+o[2];
  f=t.createElement(u);f.async=!0;f.src=i;e=t.getElementsByTagName(u)[0];e.parentNode.insertBefore(f,e);n[r]=n[r]||{_c:[],configure:function(t){n[r]._c.push(arguments)}}})
  (window,document,"//webprovisions-labs.humany.net/skeleton-chat/embed.js","Humany","script");
</script>
<!-- End Humany -->
<script src="skeleton-chat-plugin.js"></script>
```