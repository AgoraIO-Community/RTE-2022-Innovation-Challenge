class Report {
  static get(): Promise<{
    province: string;
    city: string;
    district: string;
    lng: string;
    lat: string;
  }> {
    return new Promise((resolve, reject) => {
      const res = {
        province: '',
        city: '',
        district: '',
        lng: '',
        lat: '',
      };
      try {
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function (r) {
          res.province = r?.address?.province;
          res.city = r?.address?.city;
          res.district = r?.address?.district;
          res.lat = r?.latitude;
          res.lng = r?.longitude;
          // if(this.getStatus() == BMAP_STATUS_SUCCESS){
          //   var mk = new BMap.Marker(r.point);
          //   map.addOverlay(mk);
          //   map.panTo(r.point);
          //   alert('您的位置：'+r.point.lng+','+r.point.lat);
          // }
          // else {
          //   alert('failed');
          // }
          if (!r?.point) {
            function myFun(r) {
              res.city = r?.name;
              res.lat = r?.center?.lat;
              res.lng = r?.center?.lng;
            }
            var myCity = new BMap.LocalCity();
            myCity.get(myFun);
          }
        });
      } catch (error) {
      } finally {
        resolve(res);
      }
    });
  }
}

console.log('info: ', Report.get());

export default Report;
