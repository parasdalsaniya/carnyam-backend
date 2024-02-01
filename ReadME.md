user
driver
server

api call: Create Ride

1) user -> server ("find-nearest-driver")
find nearest driver 
payload:
{
    "ride_point":[
        {
            "ride_point_name": "Nadiad",
            "latitude": "23.022505",
            "longitude": "72.571365",
            "flag_start_point": true
        },
        {
            "ride_point_name": "Ahmedabad",
            "latitude": "22.691586",
            "longitude": "72.863365",
            "flag_start_point": false
        },
        {
            "ride_point_name": "Vadodara",
            "latitude": "22.691586",
            "longitude": "72.863365",
            "flag_start_point": false
        }
    ],
    "vehicle_subtype_id": 1,
    "ride_date_time": "2023-12-27 12:00:00.000",
    "total_distance": "120",
    "estimated_time": "3 hrs",
    "daily_rout_name":"Office To Home"
}


2) server -> driver ("nearest-user-rides")
send list of nearest users ride
response:
{
    "ride_point":[
        {
            "ride_point_name": "Nadiad",
            "latitude": "23.022505",
            "longitude": "72.571365",
            "flag_start_point": true
        },
        {
            "ride_point_name": "Ahmedabad",
            "latitude": "22.691586",
            "longitude": "72.863365",
            "flag_start_point": false
        },
        {
            "ride_point_name": "Vadodara",
            "latitude": "22.691586",
            "longitude": "72.863365",
            "flag_start_point": false
        }
    ],
    "vehicle_subtype_id": 1,
    "ride_date_time": "2023-12-27 12:00:00.000",
    "total_distance": "120",
    "estimated_time": "3 hrs",
    "daily_rout_name":"Office To Home",
    "rider_name": "test name",
    "rider_gender": 1,
    "rider_image": "testlink",
}


3) driver -> server ("nearest-ride-response-from-driver")
accept or reject the ride
accept - reject from all other drivers and delete from others list
reject - just reject 
payload: 
{
    "ride_id": 34,
    "driver_id": 23,
    "status": true/false
}

4) server -> user ("nearest-driver-found")
send response to user
response:
[
    {
        "drive_id": 23,
        "driver_name: "test name",
        "driver_gender": 1,
        ...[will add more]
    }
]

----------------------------------------------------------------


1) For Driver side App
"send-driver-live-location" - Driver will send his live location on this end-point

"get-user-live-location" - Driver will get user's live location in this end-point

2) For User side App
"send-user-live-location" - User will send his live location on this end-point

"get-driver-live-location" -User will get driver's live location in this end-point