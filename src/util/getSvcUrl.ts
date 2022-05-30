export const getSvcUrl = () =>
  import.meta.env.DEV
    ? import.meta.env.VITE_SERVER_URL
    : (window.location.protocol.startsWith(`https`) ? `wss://` : `ws://`) +
      window.location.host + `/graphql`;
