Read Me

README:

Design Inspirations:
- Sources: Next and Prev nav buttons icon -> Facebook image
- Yahoo Article Slideshow
- Facebook slideshow



Performance features:
- Event handlers only on the parent of the thumbnails for better performance
- Loading slides 5 at a time
- Loading thumbnails page/250 images at a time, and load more when user reaches bottom
- As individual thumbnails come back from the API, it's rendered right away without waiting for the others to
load completely.

UX in mind features:
- Tooltip when needed, for the next and prev button
- Responsive design
- Transition and animation to better assist and aid usability.
- When image title is too long make sure to add Ellipsis on browser resize.
- Bigger next and previous button underlay.
- Next and Previous arrow and ESC keys control the slideshow as well.

Don’t have yet but would like to have:
- Non-square thumbnails, but create a mosaic much like the yahoo-magazine/flicker image tiles
- If let’s say the list of photos becomes so big, we’re storing some related data in memory so even though it’s not that 	big of data, it’s possible to run out eventually.  -Use browser store?
- Use the IP address of user to figure out the location as accurately as possible and then render the images around that location. http://ipinfo.io/  http://ipinfo.io/developers
- Lazy load the thumbnail images as well.
- After viewing bunch of slides and close it, it scroll down to that thumbnail to give user grab of what just finsihed on.
- Load the images non-linear on the browser
- When list of thumbnails shown gets really long, start removing from the top and we can have at most n number of images in DOM.
- Same for the slideshow.
