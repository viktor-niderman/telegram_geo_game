const locationsMixin = {
  dormitory: {
    latitude: 31.255222,
    longitude: 34.783896,
  },
  klita: {
    latitude: 31.252188,
    longitude: 34.779400,
  }
}

function toRadians (degrees) {
  return degrees * Math.PI / 180
}

function calculatitudeeDistance (latitude1, longitude1, latitude2, longitude2) {
  const R = 6371e3
  const f1 = toRadians(latitude1)
  const f2 = toRadians(latitude2)
  const df = toRadians(latitude2 - latitude1)
  const da = toRadians(longitude2 - longitude1)

  const a = Math.sin(df / 2) * Math.sin(df / 2) +
    Math.cos(f1) * Math.cos(f2) *
    Math.sin(da / 2) * Math.sin(da / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function isClose (point1, point2, threshold) {
  const distance = calculatitudeeDistance(point1.latitude, point1.longitude, point2.latitude,
    point2.longitude)
  return distance <= threshold
}

export default {
  locations: locationsMixin,
  isClose,
}
