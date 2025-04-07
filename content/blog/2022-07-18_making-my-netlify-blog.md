+++
title = "making [an earlier version of] this site"
date = 2022-07-18
description= "An adventure with Gatsby and Netlify"
+++

*Note: This post reflects my lessons from 2022 making an earlier iteration of this blog. It does not reflect the current tech stack or deployment.*

So, I set out to make this site in one day.

It's 9:45pm and I think I'm done. Success?

It all started with 

```shell
$> gatsby new alexjbuck.com https://github.com/thomaswang/gatsby-personal-starter-blog
```
From there, I had the regular bits of changing template code to your own. Change the author, change the title, etc... That went smooth enough.

I spent a few hours trying to figure out how to use the Netlify CMS without the `app.netlify.com` service. The long and short of that is that the CMS editor requires GitHub login (because I use GitHub as the backend for file storage). GitHub OAuth requires another server to make the login request. Netlify web service does this for you, and if I was going to ditch that I would have to roll my own server. That's not something I was wanting to do in a one-day project. So *back* to Netlify web service. I'll just redirect my domain to the `alexjbuck.netlify.app` URL that I get.

Then I had the bright idea to use Markdown pages instead of just writing my pages in JSX via Gatsby. Don't ask me why I thought this was a good idea. The pages on my site are NOT going to change often, so I really had no need to edit them through the CMS vice editing the javascript files and rebuilding with Gatsby. *ESPECIALLY* because I can just edit those pages directly in my GitHub repository and when I commit, those changes will get picked up by Netlify and deployed anyways... The big reason this failed is that `gatsby-transformer-remark` requires `gatsby ^4.0.0` while the starter template I was running was using `2.23.13`. 

Cue the terrible idea of *upgrading* my Gatsby install to `^4.0.0` so I could try and use `gatsby-transformer-remark`. I found out after the fact that I was doing an upgrade wrong, for an `npm` managed project. I manually updated the dependencies in my `package.json` and tried to run a clean install `npm ci`. That led me to dependency hell, where nothing worked. Luckily, I only wasted a few minutes here before realizing the error in my ways and reverting `package.json` and just living with Gatsby `2.23.13` and no Markdown pages.

I am much happier now.

Because of my frustrations with outdated versions, I spent about 30 minutes looking into a Hugo + [Forestry](https://forestry.io/) build but it wasn't much better, so back to Gatsby.

Now, I needed to customize the page feel a little bit, so I got in and started mucking around with the main Layout component, added a navbar, and a sticky footer.

I handled my sticky footer by first, making sure I had a full-page height (`100vh`) container that held my navbar, body, and footer; and then letting the footer grow while pushing its content to the bottom/center. The component above the footer could change, so it was easier to have the footer be the growing element, it just meant I had to also use `align-items: end` to push its contents to the bottom instead of the top of the footer.

Note: I'm using the `styled-components` library, so no external CSS here, just styled components.

```javascript
const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`
const Footer = styled.footer`
  justify-content: center;
  align-items: end;
  margin: 24px;
  flex-grow: 1;
  display:inline-flex;
  flex-direction: row;
`
```

The last item I added was a "Scroll to Top" component. It's pretty straightforward. The component renders a single `div`, called `<ScrollTop>` with an `onClick` attribute that scrolls to the top of the page.

The fancy bits came when I wanted the component to fade in as you scroll down. I needed to store the `display` state, so I brought in `useState`. 
```javascript
const [display,setDisplay] = useState(false);
```
In order to set the `display` state, I needed to check if the window had scrolled down. This is where `useEffect` comes in; it lets us add a `scroll` event listener to the `window` object when the component is loaded. We give `useEffect` no dependencies so it won't ever run again, just the one time on load.

```javascript
useEffect(() => {
    const checkScrollTop = () => {
        if (!display && window.pageYOffset > 100) {
            setDisplay(true);
        } else if (display && window.pageYOffset <= 100) {
            setDisplay(false);
        }
    }
    window.addEventListener('scroll', checkScrollTop);
});
```

Now, when the window scrolls, once it scrolls past the defined threshold, the `display` flag gets set to `true` instead of `false`.

Down in the return section, we add a style attribute with value:
```javascript
return (
    <ScrollTop style={{display: display?'flex':'none'}} onClick={...}>
        ...
    </ScrollTop>
)
```
The only thing left is to set the style for `<ScrollTop>` and pick an icon.

```javascript
const ScrollTop = styled.div`
    position: fixed;
    bottom: 50px;
    right: 100px;
    height:50px;
    z-index: 100;
    cursor: pointer;
    opacity: 0.5;
    animation: fadeIn 1.5s;
    transition: opacity 0.3s;
    @keyframes fadeIn {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 0.5;
        }
    }
    &:hover {
        opacity: 1.0;
    }
`
```
This styled div gives us an object that is fixed in the bottom-right corner, and controls the fade-in. The `animation` and `@keyframes` controls how the icon fades in when it is displayed (when `display` is set to `true`). The `transition: opacity` controls the response when `:hover`ed.

I browsed through [React-Icons](https://react-icons.github.io/react-icons/) to find a suitable icon and settled on `<FaArrowAltCircleUp>` which you can import with

```javascript
import { FaArrowAltCircleUp } from 'react-icons/fa';
```
That brings me more or less to now, and my dinner is getting cold so I'm going to be done.

Cheers!