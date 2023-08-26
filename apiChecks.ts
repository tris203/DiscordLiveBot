import Client from 'kick-api-wrapper';

function isKickLive(channelName: string, platform: string) {
    const client = new Client({
        cache: {
            enabled: true,
            ttl: 60000
        }
    });

    return client.getChannel(channelName)
        .then((channel: any) => {
          //if channel.livestream.is_live is null, return false
            if (channel.livestream?.is_live) {
                
                const data: any = {
                    isLive: channel.livestream.is_live,
                    title: channel.livestream.session_title || "",
                }
                //console.log(JSON.stringify(data));
                return data;
            }
            return false; 
        })
        .catch((error: Error) => {
            console.error("Error:", error);
            return false; // You can handle errors gracefully and return an appropriate value
        });
}


export { isKickLive };
