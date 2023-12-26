// stadiumModel.js
const pool = require('../db');
const path = require('path');

async function checkStadiumNameExists(name) {
  try {
    const result = await pool.query('SELECT * FROM stadiums WHERE name = $1', [name]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking stadium name:', error);
    throw new Error('Internal server error');
  }
}

async function insertStadium(name, city, location, size, hourly_rate, description, owner_id, approval_status, images_url, phone, start_time, end_time) {
  try {
    const result = await pool.query(
      'INSERT INTO stadiums (name, city, location, size, hourly_rate, description, owner_id, approval_status, images_url, phone, start_time, end_time, deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, false) RETURNING *',
      [name, city, location, size, hourly_rate, description, owner_id, approval_status, images_url, phone, start_time, end_time]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error inserting stadium:', error);
    throw new Error('Internal server error');
  }
}


async function getStadiumByOwnerId(ownerId) {
    try {
      const mystadium = await pool.query('SELECT * FROM stadiums WHERE owner_id = $1', [ownerId]);
      return mystadium.rows[0];
    } catch (error) {
      console.error('Error executing query', error);
      throw new Error('Internal server error');
    }
  }
  async function isStadiumOwner(user_id) {
    try {
      const result = await pool.query('SELECT * FROM stadiums WHERE owner_id = $1', [user_id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking stadium ownership:', error);
      throw new Error('Internal server error');
    }
  }

  
  async function deleteMyStadium(stadiumId, ownerId) {
    try {
      const stadiumResult = await pool.query('UPDATE stadiums SET deleted = true, owner_id = null WHERE stadium_id = $1 AND owner_id = $2 RETURNING *', [stadiumId, ownerId]);
  
      if (stadiumResult.rows.length === 0) {
        return null; // يعني الملعب غير موجود أو غير مخول
      }
  
      const updatedStadiumId = stadiumResult.rows[0].stadium_id;
  
      // Soft Delete للملعب
      const updateResult = await pool.query('UPDATE stadiums SET deleted = true, owner_id = null WHERE stadium_id = $1 RETURNING *', [updatedStadiumId]);
  
      return updateResult.rows[0];
    } catch (error) {
      console.error('Error executing query', error);
      throw new Error('Internal server error');
    }
  }

  async function getApprovedStadiums() {
    try {
      const result = await pool.query('SELECT stadium_id, name, city, location, size, hourly_rate, description, owner_id, approval_status, images_url, phone, start_time, end_time, deleted FROM public.stadiums WHERE approval_status = $1', ['approved']);
      const stadiums = result.rows;
  
      const stadiumsWithImageUrl = stadiums.map(stadium => {
        if (stadium.images_url && Array.isArray(stadium.images_url)) {
          return {
            ...stadium,
            images_url: stadium.images_url.map(url => {
              const basename = path.basename(url);
              const formattedUrl = `https://firebasestorage.googleapis.com/v0/b/football-626b1.appspot.com/o/${basename}?alt=media&token=860bf795-35f4-485e-a2d7-285a02d27bcd`;
              return formattedUrl;
            })
          };
        } else if (stadium.images_url && typeof stadium.images_url === 'object') {
          return {
            ...stadium,
            images_url: stadium.images_url
          };
        } else {
          return stadium;
        }
      });
  
      return stadiumsWithImageUrl;
    } catch (error) {
      console.error('Error fetching stadiums:', error);
      throw new Error('Internal Server Error');
    }
  }
  
  async function getStadiumDetails(stadiumId) {
    try {
        const stadiumResult = await pool.query('SELECT * FROM stadiums WHERE stadium_id = $1', [stadiumId]);
        
        if (stadiumResult.rows.length === 0) {
            return null; // لا يوجد ملعب مطابق للمعرف المعطى
        }

        const { stadium_id, name, city, location, size, hourly_rate, description, phone, start_time, end_time, images_url } = stadiumResult.rows[0];

        // استخدم JSON.parse لتحويل النص إلى مصفوفة إذا كانت ليست بالفعل
        const imagesArray = Array.isArray(images_url) ? images_url : JSON.parse(images_url);

        const stadiumData = {
            stadium_id,
            name,
            city,
            location,
            size,
            hourly_rate,
            description,
            phone,
            start_time,
            end_time,
            images_url: imagesArray
        };

        return stadiumData;
    } catch (error) {
        console.error('Error executing query', error);
        throw new Error('Internal server error');
    }
}




module.exports = {
    checkStadiumNameExists,
    insertStadium,
    getStadiumByOwnerId,
    isStadiumOwner,
    deleteMyStadium,
    getApprovedStadiums,
    getStadiumDetails,

};
