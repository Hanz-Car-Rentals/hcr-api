var db = require('../db');

async function rentCar(userId, carId, fromDate, toDate) {
    try {
        // Start transaction
        await db.beginTransaction();

        // Update users table
        await db.query('UPDATE users SET times_rented = times_rented + 1, currently_renting = ? WHERE id = ?', [carId, userId]);

        // Update cars table
        await db.query('UPDATE cars SET rented_by = ? WHERE id = ?', [userId, carId]);

        // Insert into rentallog table
        await db.query('INSERT INTO rentallog (car_id, user_id, rent_date, return_date) VALUES (?, ?, ?, ?)', [carId, userId, fromDate, toDate]);

        // Commit transaction
        await db.commit();

        console.log("Car rented successfully!");

    } catch (error) {
        // Rollback if any error occurs
        await db.rollback();
        throw error;
    }
}

module.exports = {
    rentCar
}