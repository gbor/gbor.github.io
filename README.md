
This project/web page shows the gallery of images taken around Yosemite.  Location detection and taking user input is the next feature to added.

Final Demo can be found at http://gbor.github.io/index.html

Design Inspirations:
- Sources: Next and Prev nav buttons icon -> Facebook image
- Yahoo Article Slideshow
- Facebook slideshow


Performance features:
- Event handlers only on the parent of the thumbnails for better performance
- Loading slides 5 at a time
- Loading thumbnails page/250 images at a time, and load more when user reaches bottom
- As individual thumbnails come back from the API, it's rendered right away without waiting for the others to load completely

UX in mind features:
- Tooltip when needed, for the next and prev button
- Responsive design for desktop
- Transition and animation to better assist and aid usability
- When image title is too long make sure to add Ellipsis on browser resize
- Bigger next and previous button underlay
- Next and Previous arrow and ESC keys control the slideshow as well
- After viewing bunch of slides and close it, it scroll down to that thumbnail to give user grab of what just finished on
- While viewing images in the slideshow, loads next page of images as well

Known bugs and Issues:
- Since there's no smartphone detection, it still loads the thumbnails Desktop-appropraite numbers and it's slow
- On chrome, unlike other browsers when height is too small the img ratio is not kept


Don’t have yet but would love to have:
- Non-square thumbnails, but create a mosaic much like the yahoo-magazine/flickr image tiles
- Hypothetically if let’s say the list of photos becomes so big, we’re storing some related data in memory so even though it’s not that big of data, but it’s possible to run out eventually  -Use browser store?
- Use the IP address of user to figure out the location as accurately as possible and then render the images around that location, http://ipinfo.io/  http://ipinfo.io/developers
- Lazy load the thumbnail images as well
- Load the images non-linear on the browser
- When list of thumbnails shown gets really long, start removing from the top and we can have at most n number of images in DOM
- Same for the slideshow
- When reach the edges of the slideshow, hide the next/prev navigation buttons
- Add user info on the tile and show on hover

TODOs:
- Clean up code more and remove TODOs
- Extend the API interface to make it workable not only with Flickr but also Google image and Yahoo API
- Break the Gallery object into different sub objects, ex: slideshow, tiles, and keep their own logics separately
- Optimize for mobile and tablet as well
- Complete documenting
