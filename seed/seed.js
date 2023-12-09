const fs = require('fs');
const client = require('../connection/database');
const path = require('path');

async function seedData() {
    try {
        const subDistrictCount = await client.query(`SELECT COUNT(*) AS rowcount FROM sub_district;`)
        if(subDistrictCount.rows[0].rowcount == 0) await addStateDistrictData()
        console.log("Data inserted successfully.");
    } catch (error) {
        console.error("Error inserting data:", error);
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