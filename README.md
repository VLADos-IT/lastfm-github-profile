# Last.fm Github profile

Display your current **Last.fm Obsession** or **Top Track** (most played). in your GitHub README.

## 🚀 Usage

Copy the following code into your `README.md` and replace `YOUR_USERNAME`:

```markdown
[![Last.fm Obsession](https://lastfm-github-profile.vercel.app/api?user=YOUR_USERNAME)](https://www.last.fm/user/YOUR_USERNAME)
```

### Configuration

For detailed API documentation, please refer to [API.md](assets/API.md).

| Parameter | Description                                            | Default   |
| :-------- | :----------------------------------------------------- | :-------- |
| `user`    | Your Last.fm username (required)                       | -         |
| `bg`      | Background color(e.g. ffffff), 'none' or `transparent` | `181818`  |
| `width`   | Width of the SVG in pixels                             | `400`     |
| `mode`    | Display mode: `smart` (default), `obsession`, `top`    | `smart`   |
| `theme`   | Visual theme: `default`, `retro`                       | `default` |

### Modes

- **smart**: Tries to show your Current Obsession. If not set, shows your Top Track (most recent).

> [!WARNING]
>
> - **obsession**: Only shows Current Obsession. Displays an error if none is set.  
> - **top**: Forces the display of "Top Track" label.

### Example

```markdown
[![Last.fm Obsession](https://lastfm-github-profile.vercel.app/api?user=vlados14311&bg=181818&mode=top)](https://www.last.fm/user/vlados14311)
```

![Example](assets/example.svg)

## Deployment

### Self-Hosting with Docker / Podman

If you prefer to host it yourself.

1. **Build the image:**

    ```bash
    podman build -t lastfm-obsession .
    ```

2. **Run the container:**

    ```bash
    podman run -d -p 3000:3000 --name lastfm-obsession lastfm-obsession
    ```

3. **Access:**
    Your API will be available at `http://YOUR_SERVER_IP:3000/api?user=YOUR_USERNAME`.

> [!NOTE]
> **Creating Custom Themes**
>
> You can easily add your own themes
>
> 1. **Create a Template**: Add a new `.js` file in `lib/templates/`
> 2. **Create Styles**: Add a `.css` file in `lib/styles/`
> 3. **Use**: `&theme=NEW` in the URL
>
> `!Exists theme => Default`

## Features

- **Smart Fallback**: Automatically switches to "Top Track" if no obsession is currently set.
- **Customizable**: Change background color and width.
- **Fast**: Uses Vercel Serverless Functions for low latency.
- **No API Key Required**: Scrapes public profile data, so no need to manage secrets.

## TODO

- [ ] Top track in range (LAST FM API REQUIRED)
- [ ] Other designs
- [ ] Configuration improvements
