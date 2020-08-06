const Geocodio = require('geocodio-library-node');

const forward = "geocode";
const reverse = "reverse";

async function onCreateNode({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
},
  pluginOptions
) {

  let nodeGeocodeConfig = false;
  for (i = 0; i < pluginOptions.nodeTypes.length; i++) {
    if (node.internal.type == pluginOptions.nodeTypes[i].nodeType) {
      nodeGeocodeConfig = pluginOptions.nodeTypes[i];
    }
  }

  if (!nodeGeocodeConfig) {
    return;
  }

  if (!pluginOptions.api_key) {
    console.warn("Geocoding specified for this node type (" + node.internal.type + " but no API key set");
    return;
  }

  let geocodeType = false;
  if (nodeGeocodeConfig.addressFields) {
    geocodeType = forward;
  }
  else if (nodeGeocodeConfig.positionFields) {
    if (nodeGeocodeConfig.positionFields.lat &&
      nodeGeocodeConfig.positionFields.lon) {
    geocodeType = reverse;
    }
    else {
      console.warn("Geocoder options for positionFields (lat, lon) not specified");
    }
  }

  if (!geocodeType) {
    console.warn("Geocoding specified for this node type (" + node.internal.type + " but couldn't determine geocoding type");
    return;
  }

  const { createNode, createNodeField, createParentChildLink } = actions

  const geocoder = new Geocodio(pluginOptions.api_key);

  let query = false;
  let data = {}
  if (geocodeType == forward) {
    let addressElements = [];
    for (let i = 0; i < nodeGeocodeConfig.addressFields.length; i++) {
      if (node[nodeGeocodeConfig.addressFields[i]]) {
        addressElements.push(node[nodeGeocodeConfig.addressFields[i]]);
      }
    }
    query = addressElements.join(", ");
    console.log("Geocoding: " + query);
  }
  else if (geocodeType == reverse) {
    query = node[nodeGeocodeConfig.positionFields.lat] + "," + node[nodeGeocodeConfig.positionFields.lon]
    console.log("Reverse Geocoding: " + query);
  }
  try {
    data = await geocoder.handleRequest(geocodeType, query, nodeGeocodeConfig.additionalFields = [], nodeGeocodeConfig.limit = null);
    if (data.results.length > 0) {
      var place = data.results[0];

      if (geocodeType == forward) {
        createNodeField({
          node,
          name: `geocoderLocation`,
          value: place.location
        });
      }
      else if (geocodeType == reverse) {
        createNodeField({
          node,
          name: `geocoderAddress`,
          value: place.formatted_address
        });
        createNodeField({
          node,
          name: `geocoderAddressFields`,
          value: place.address_components
        });
      }

      if (nodeGeocodeConfig.addFullResult) {
        createNodeField({
          node,
          name: `geocoderFullResult`,
          value: place
        });
      }
    }
  }
  catch(error) {
    console.error('error', error.message);
  }
}

exports.onCreateNode = onCreateNode