const nodeGeocoder = require('node-geocoder');


//set the user lat and lag if not provided by user
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
        lag: loc[0].longitude,
        lat: loc[0].latitude,
      };
      return location;
    } catch (err) {
      return err;
    }
  }
}
