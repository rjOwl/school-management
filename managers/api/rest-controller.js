// custom restful services to better handle errors
const restfulServices = (Model) => {
  return {
    /**
     * Create a new document
     * @param {Object} data - The data to create the document with
     * @returns {Promise} - A promise that resolves with the newly created document
     * @throws {Error} - If there was an error creating the document
     */
    create: async (data) => {
      try {
        // Create a new document with the provided data and save it to the database
        return await new Model(data).save();
      } catch (error) {
        // Log the error and rethrow it
        console.log(`Error from ${Model.modelName} on create: `, error);
        throw error;
      }
    },

    /**
     * Retrieves a document from the database based on the given query.
     * 
     * @param {Object} query - The query object used to find the document.
     * @returns {Promise<Object>} - A promise that resolves to the retrieved document.
     * @throws {Error} - If an error occurs while retrieving the document.
     */
    get: async (query) => {
      try {
        return await Model.findOne(query);
      } catch (error) {
        console.log(`Error from ${Model.modelName} on get: `, error);
        throw error;
      }
    },

    /**
     * Find a document by id
     * @param {*} id - The id of the document to find
     * @returns {Promise} - A promise that resolves with the found document or rejects with an error
     */
    findById: async (id) => {
      try {
        // Find the document by id using the Model
        return await Model.findById(id);
      } catch (error) {
        // Log the error and rethrow it
        console.log(`Error from ${Model.modelName} on findById: `, error);
        throw error;
      }
    },

    /**
     * Retrieves all documents based on the provided query.
     * 
     * @param {Object} query - The query object to filter the documents.
     * @returns {Promise<Array>} - A promise that resolves to an array of documents.
     * @throws {Error} - If there is an error retrieving the documents.
     */
    getAll: async (query) => {
      try {
        return await Model.find(query); // Retrieve all documents based on the query
      } catch (error) {
        console.log(`Error from ${Model.modelName} on getAll: `, error); // Log the error
        throw error; // Rethrow the error
      }
    },

    /**
     * Update a document
     * @param {Object} query - The query to find the document to update
     * @param {Object} data - The new data to update the document with
     * @returns {Promise} - A promise that resolves to the updated document
     * @throws {Error} - If there was an error updating the document
     */
    update: async (query, data) => {
      try {
        // Find and update the document
        return await Model.findOneAndUpdate(query, data, {
          new: true,
        });
      } catch (error) {
        // Log and rethrow the error
        console.log(`Error from ${Model.modelName} on update: `, error);
        throw error;
      }
    },

    /**
     * Delete a document
     * @param {Object} query - The query to find the document to delete
     * @returns {Promise} - A promise that resolves with the deleted document or rejects with an error
     */
      delete: async (query) => {
            try {
              return await Model.findOneAndDelete(query);
            } catch (error) {
              console.log(`Error from ${Model.modelName} on delete: `, error);
              throw error;
            }
          },
        };
};

module.exports = restfulServices;
