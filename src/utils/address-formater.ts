const nodeGeocoder = require('node-geocoder');
export class AddressFormate {
  static async getPropertyLocation(address: string) {
    try {
      const options = {
        provider: process.env.GEOCODE_PROVIDER,
        apiKey: process.env.GEOCODE_API,
        formatter: null,
      };
      const geoCoder = nodeGeocoder(options);
      const loc = await geoCoder.geocode(address);
      const location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode,
      };
      return location;
    } catch (err) {
      return err;
    }
  }
}
