declare module 'kick-api-wrapper' {
    interface CacheOptions {
      enabled: boolean;
      ttl: number;
    }
  
    interface Livestream {
      is_live: boolean | null;
      session_title: string | null;
      // Add other properties if available
    }
  
    interface Channel {
      // Add properties relevant to the Channel object
      livestream: Livestream;
    }
  
    interface ClientOptions {
      cache?: CacheOptions;
      // Add other options as needed
    }
  
    class Client {
      constructor(options: ClientOptions);
      getChannel(channelName: string): Promise<Channel>;
      // Add other methods if available
    }
  
    export = Client;
  }
  