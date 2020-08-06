# gatsby-transformer-geocodio

Uses [Geocodio](https://www.geocod.io) to do the following:

1. Adds geospatial coordinates to nodes that just contain address information, so you can eg display them on a map. (aka Forward Geocoding)
2. Adds address information to nodes that contain just coordinates (ie lat/lon). (aka Reverse Geocoding)

So, this means, for example, that if you have a bunch of nodes in a CSV file that contain address information, but you want to display them on a map, you can add the lat-long coordinates to each node using this transformer plugin.

Or, if you've got some nodes in an Excel file that just contain lat-long coordinates, but you want to display address information alongside them, this transformer plugin can do that as well.

This plugin was forked from the original https://github.com/andrewl/gatsby-transformer-opencage-geocoder, which was sponsored by [OpenCage Data](https://opencagedata.com).

## Install

You'll need to install both this module and the geocodio-library-node module.

`npm i gatsby-transformer-geocodio geocodio-library-node`

## How to use

In your gatsby-config.js add:

```javascript
    {
      resolve: `gatsby-transformer-geocodio`,
      options: {
// Your OpenCage API key      
        api_key: `<YOUR GEOCODIO API KEY>`,
        
// An array of configurations per node type to geocode        
        nodeTypes: [
// Forward Geocoding
          { nodeType: `NodeTypeToBeGeocoded`,
            addressFields: [
              'Address1', 'Address2', 'Address3', 'Town', 'Country', 'Postcode'],
            addFullResult: false,
          },
          
// Reverse Geocoding
          { nodeType: `NodeTypeToBeReverseGeocoded`,
            positionFields: {
              lat: `lat`,
              lon: `lon`
            },
            addFullResult: true,
          }
          
        ]
      }
    }
```

## Options

api_key: Your OpenCage API Key. Get one at https://geocod.io/

nodeTypes: An array of geocoding configurations, one for each node type that you want to geocode (or reverse geocode). Each element in the array is an object which needs to contain the following elements, depending on whether you want to forward- or reverse-geocode.

### Forward geocoding an node type 

nodeType: the name of the node type to forward geocode

addressFields: an array of fields that contain the node's address. The address to be geocoded will be determined by concatenating all the fields in this array, in order. Some tips on how to format addresses can be found at https://www.geocod.io/docs/#address-formats-2

addFullResult: if set to true, this will request and add the 'address_components' section of the geocoder result, as a field 'geocoderAddressFields' which contains extended information (see https://www.geocod.io/docs/#address-components)

Forward geocoding will add a new field 'geocoderLocation' which contains a lat and lon pair. eg

```
"node": {
  "id": "8351ce9c-d0b5-5393-9ac6-aaa049a1d2c7",
  "AppNo": "AR 003",
  "fields": {
    "geocoderLocation": {
      "lat": 50.831528,
      "lng": -0.240344
    }
  }
}
```


### Reverse geocoding an node type 

nodeType: the name of the node type to forward geocode

locationFields: an object containing two elements - 'lat' - the name of the field containing the latitude of the node, and 'lon' - the name of the field containing the longitude of the node

addFullResult: if set to true, this will request and add the 'address_components' section of the geocoder result, as a field 'geocoderFullResult' which contains extended information (see https://www.geocod.io/docs/#address-components)

Reverse geocoding will add a two new fields:
'geocoderAddress' - a string containing the formatted address of the location specified by the lat-lon pair, and
'geocoderAddressFields' - which contains an object containing the components of the address of the location specified by the lat-lon pair (NB please dont rely on any specific field being in the components that are returned, as they may not be.

```
"node": {
            "id": "65879725-c151-5abf-8524-0dcdad0bb614",
            "fields": {
              "geocoderAddress": "163 Rue Jeanne d'Arc, 54000 Nancy, France",
              "geocoderAddressFields": {
                "number": "1109",
                "predirectional": "N",
                "street": "Highland",
                "suffix": "St",
                "formatted_street": "N Highland St",
                "city": "Arlington",
                "county": "Arlington County",
                "state": "VA",
                "zip": "22201",
                "country": "US"
              }
            }
        }
```          

### Availability

Geocodio results are available in the US and Canada. For worldwide results, please consider using [OpenCage Geocoder](https://opencagedata.com).
