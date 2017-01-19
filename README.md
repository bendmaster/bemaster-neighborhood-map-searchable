#GreenLake Seattle Neighborhood Map Project
Inspired by my moving to this location, I have created an application using the Knockout.js framework to display local bars along with information relevant to each bar. Additionally, users can search the map using an input field located on the left side.

##How does it work?
The application utilizes the following library:

1. Bootstrap
  * Provides styling for the project

The application also uses the following APIs:

1. Google Maps API
  * This API provides the functionality for generating the map as well as the markers used to indicate points of interest
2. Foursquare API
  * This API pulls information relevant to each location

Finally, the application uses the Knockout.js framework to provide a MVVM separation of concerns

##How do I use it?
Click on index.html in the provided file to run the application. The application was designed for Chrome but also works on other modern browsers (Firefox, Edge, etc.).

For optimal viewing experience, a desktop is preferred. However, this application can be viewed and operated as normal using a variety of devices

A list of 10 bars in the GreenLake area are displayed. To filter the bars, start typing any of the letters contained within the name of the bar.

##Resources
* [Google Maps API](https://developers.google.com/maps/documentation/javascript)
* [Knockout.js](http://knockoutjs.com/documentation/introduction.html)
* [Boostrap](http://getbootstrap.com/)
* [Foursquare API](https://developer.foursquare.com/)

##Credit
The styling for the map is from a chapter in a book I have called [Javascript & jQuery](http://javascriptbook.com/) by Jon Duckett

Also a big thanks to this [article](http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html) from [http://www.knockmeout.net/](http://www.knockmeout.net/) for showing how to use the arrayFilter tool

