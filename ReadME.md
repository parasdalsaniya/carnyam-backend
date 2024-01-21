user
driver
server



1) user -> server ("find-nearest-driver")
find nearest driver 

2) server -> driver ("nearest-user-rides")
send list of nearest users ride

3) driver -> server ("nearest-ride-response-from-driver")
accept or reject the ride
accept - reject from all other drivers and delete from others list
reject - just reject 

4) server -> user ("nearest-driver-found")
send response to user

5) Remaning : Find Driver By Vichale Type ( Find Nearest Driver ) 
