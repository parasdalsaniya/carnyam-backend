const fs = require('fs');
const client = require('../connection/database');
const path = require('path');
const { vehicleTypes, vehicleSubTypes } = require('./VehicleTypes');

async function seedData() {
    try {
        const subDistrictCount = await client.query(`SELECT COUNT(*) AS rowcount FROM sub_district;`)
        if (subDistrictCount.rows[0].rowcount == 0) await addStateDistrictData()

        const vehicleTypeCount = await client.query(`SELECT COUNT(*) AS rowcount FROM vehicle_type;`)
        const subTypeCount = await client.query(`SELECT COUNT(*) AS rowcount FROM vehicle_subtype;`)
        if ((vehicleTypeCount.rows[0].rowcount == 0) || (subTypeCount.rows[0].rowcount == 0)) await addCarTypeData()

        console.log("Data inserted successfully.");
    } catch (error) {
        console.error("Error inserting data:", error);
        throw error;
    }
}

async function addCarTypeData() {
    try {
        await client.query('BEGIN');
        for (const vehicleType of vehicleTypes) {
            const insertVehicleTypeQuery = `INSERT INTO vehicle_type (vehicle_type_name) VALUES ($1) RETURNING vehicle_type_id`;
            const vehicleTypeResult = await client.query(insertVehicleTypeQuery, [vehicleType]);
        }
        for (const subType of vehicleSubTypes) {
            const queryText = `
            INSERT INTO vehicle_subtype (vehicle_type_id, vehicle_subtype_name, vehicle_subtype_price_per_km, vehicle_subtype_num_of_seats)
            SELECT vt.vehicle_type_id, $1, $2, $3
            FROM vehicle_type vt
            WHERE vt.vehicle_type_name = $4
                RETURNING vehicle_subtype_id
            `;
            const { vehicle_type, name, vehicle_subtype_price_per_km, vehicle_subtype_num_of_seats } = subType;
            const subTypeResult = await client.query(queryText, [name, vehicle_subtype_price_per_km, vehicle_subtype_num_of_seats, vehicle_type]);
        }

        await client.query('COMMIT');
        console.log("Car Type Data inserted successfully.");
    } catch (error) {
        throw error;
    }
}

async function addStateDistrictData() {
    try {
        const directoryPath = path.join(__dirname + '/SateDistirctData/');
        const files = fs.readdirSync(directoryPath);

        files.forEach(async (file) => {
            await client.query('BEGIN');
            const filePath = directoryPath + file;

            const jsonContent = fs.readFileSync(filePath);
            const stateData = JSON.parse(jsonContent);

            const insertStateQuery = `INSERT INTO state (state_name) VALUES ($1) RETURNING id`;
            const stateResult = await client.query(insertStateQuery, [stateData.sate]);
            const stateId = stateResult.rows[0].id;

            for (const district of stateData.district_name) {
                const insertDistrictQuery = `INSERT INTO district (state_id, district_name) VALUES ($1, $2) RETURNING id`;
                const districtResult = await client.query(insertDistrictQuery, [stateId, district.district_name]);
                const districtId = districtResult.rows[0].id;

                for (const subDistrict of district.sub_district_name) {
                    const insertSubDistrictQuery = `INSERT INTO sub_district (state_id, district_id, sub_district_name) VALUES ($1, $2, $3)`;
                    await client.query(insertSubDistrictQuery, [stateId, districtId, subDistrict]);
                }
            }
            await client.query('COMMIT');
        });

        console.log("State Data inserted successfully.");
    } catch (error) {
        throw error;
    }
}

module.exports = {
    seedData
}