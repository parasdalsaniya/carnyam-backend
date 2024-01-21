const vehicleTypes = ["car", "bike", "rickshaw"]

const vehicleSubTypes = [
    {
        vehicle_type: 'car',
        name: 'luxury',
        vehicle_subtype_price_per_km: 25,
        vehicle_subtype_num_of_seats: 4
    },
    {
        vehicle_type: 'car',
        name: 'hatchback',
        vehicle_subtype_price_per_km: 15,
        vehicle_subtype_num_of_seats: 4
    },
    {
        vehicle_type: 'car',
        name: 'suv',
        vehicle_subtype_price_per_km: 20,
        vehicle_subtype_num_of_seats: 4
    },
    {
        vehicle_type: 'bike',
        name: 'bike',
        vehicle_subtype_price_per_km: 9,
        vehicle_subtype_num_of_seats: 1
    },
    {
        vehicle_type: 'rickshaw',
        name: 'rickshaw',
        vehicle_subtype_price_per_km: 12,
        vehicle_subtype_num_of_seats: 3
    },
]

module.exports = {
    vehicleTypes,
    vehicleSubTypes
}