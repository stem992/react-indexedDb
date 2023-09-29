import Dexie from 'dexie';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase, faEdit, faTrashAlt, faPlus, faTimes, faCheck,
         faPen, faSearch  } from '@fortawesome/free-solid-svg-icons'

export default function List() {

  const [nomeDb] = useState('NomyoDB');

  useEffect(() => {
    const db = new Dexie(nomeDb);
    db.open().then(() => {
      setTableNames(db.tables.map(table => table.name));
      console.table(db.tables.map(table => ({
        tableName: table.name,
        primaryKey: Array.isArray(table.schema.primKey.keyPath)
          ? table.schema.primKey.keyPath.join(', ')
          : table.schema.primKey.keyPath
      })));
    }).catch((error) => {
      console.error('Failed to open the database:', error);
    });
  }, [nomeDb]);  

  const [tableName, setTableName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTerms, setSearchTerms] = useState('');
  const [setSearchCount] = useState('');
  const [tableData, setTableData] = useState([]);
  const [tableNames, setTableNames] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showResults, setShowResults] = useState([]);
  const [searchedRows] = useState([]);
  const [newRowValue, setNewRowValue] = useState({});
  const searchCount = useState({});
  const [editingRow, setEditingRow] = useState(null);
  const [showInputs, setShowInputs] = useState(false);
  const [isClear, setIsClear] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  const updateTable = () => {
    const db = new Dexie(nomeDb);
    db.open()
      .then(() => {
        const table = db.table(tableName);
        return table.toArray();
      })
      .then((data) => {
        setTableData(data); // aggiorna lo stato del componente
      })
      .catch((error) => {
        console.error("Error retrieving data: " + error);
        alert("An error occurred while updating the table");
      })
      .finally(() => {
        db.close();
      });
  };
  
  const filteredTableNames = tableNames.filter((name) =>
    name.toLowerCase().includes(searchTerms.toLowerCase())
  );

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerms(event.target.value);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };
  
  const toggleInputs = () => {
    setShowInputs(!showInputs);
  }

  const handleClear = () => {
    setSearchTerm('');
    setIsClear(false);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    setSearchCount({});
  }

  const handleEditRow = (row) => {
    setEditingRow(row);
    setNewRowValue(row);
    console.log("You clicked on Edit");
    window.scrollTo(0, document.body.scrollHeight);
  }
  
  const handleMassEdit = () => {
    const oldValue = document.getElementById("oldValueInput").value;
    const newValue = document.getElementById("newValueInput").value;
  
    // Seleziona la colonna da modificare utilizzando il valore selezionato dall'utente dal menu a discesa
    const selectedColumn = document.getElementById("columnNameInput").value;
  
    if (!oldValue || !newValue || !selectedColumn) {
      alert("Please fill in all required fields");
      return;
    }
  
    const db = new Dexie(nomeDb);
    db.open()
      .then(() => {
        const table = db.table(tableName);
        // Modifica le righe che corrispondono alla colonna selezionata
        return table.where(selectedColumn).equals(oldValue).modify({ [selectedColumn]: newValue });
      })
      .then(() => {
        console.log("Mass edit completed successfully");
        updateTable();
      })
      .catch (Dexie.ModifyError, error => {
        console.error(error.failures.length + " items failed to modify");
      })
      .catch (error => {
        console.error("Generic error: " + error);
        alert("An error occurred during the bulk editing operation");
      })
      .finally(() => {
        db.close();
        updateTable();
      });
  };  
  
  async function handleSavedRowFunction() {
    const db = new Dexie(nomeDb);
    try {
      await db.open();
      const table = db.table(tableName);
      const primaryKey = table.schema.primKey.keyPath;
      if (!primaryKey) {
        console.error("Table " + tableName + " does not have a primary key defined");
        return;
      }
      const updatedRow = { ...editingRow, ...newRowValue };
      const currentKey = Array.isArray(primaryKey) ? primaryKey.find(key => updatedRow[key] !== null) : primaryKey;

      // Verifica se la chiave esiste
      if (!currentKey) {
        alert("Missing key field in updated row.");
        return;
      }

      // Verifica se la riga aggiornata ha valori non vuoti
      const hasNonEmptyValue = Object.values(updatedRow).some(val => val !== '');
      if (!hasNonEmptyValue) {
        alert("Cannot save an empty row.");
        return;
      }

      // Verifica se esiste già una riga con la stessa chiave
      const existingRow = await table.get(updatedRow[currentKey]);
      if (existingRow && existingRow[currentKey] !== editingRow[currentKey]) {
        alert(`Key value '${updatedRow[currentKey]}' already exists in the table`);
        const idCell = document.querySelector(`td[data-${currentKey.toLowerCase()}="${updatedRow[currentKey]}"]`);
        idCell.classList.add("error");
        return;
      }

      if (editingRow && editingRow[currentKey] !== updatedRow[currentKey]) {
        await table.delete(editingRow[currentKey]);
      }
      await table.put(updatedRow);
      console.log(`Successfully saved ${tableName} items`);
      setEditingRow(null);
      setNewRowValue({});

      if (tableData.length > 0 && Object.values(tableData[0]).every(val => val === '')) {
        setTableData(prevTableData => prevTableData.slice(1));
        if (Array.isArray(primaryKey)) {
          const whereClause = primaryKey.reduce((acc, key) => {
            acc[key] = '';
            return acc;
          }, {});
          await table.where(whereClause).delete();
        } else {
          await table.delete(1);
        }
      }
      updateTable();
    } catch (error) {
      console.error("Error saving row in Dexie database:", error);
    } finally {
      await db.close();
    }
  }
  
  const handleCancelEditMod = () => {
    if (editingRow) {
      setEditingRow(null);
    }
  
    if (tableData.length > 0 && Object.values(tableData[0]).every(val => val === '')) {
      setTableData(prevTableData => prevTableData.slice(1));
      const db = new Dexie(nomeDb);
      db.open().then(() => {
        const table = db.table(tableName);
        const primaryKey = table.schema.primKey.keyPath;
        if (!primaryKey) {
          console.error("Table " + tableName + " does not have a primary key defined");
          return;
        }
        if (Array.isArray(primaryKey)) {
          const currentKey = primaryKey.filter(key => editingRow[key] !== null);
          if (!currentKey || currentKey.length !== primaryKey.length) {
            alert("Missing key field in updated row.");
            return;
          }
          const whereClause = currentKey.reduce((acc, key) => {
            acc[key] = editingRow[key];
            return acc;
          }, {});
          table
            .where(whereClause)
            .delete()
            .then(() => {
              updateTable();
            })
            .catch((error) => {
              console.error("Generic error: " + error);
              alert("An error occurred during the delete operation");
            })
            .finally(() => {
              db.close();
              updateTable();
            });
        } else {
          table
            .delete(editingRow[primaryKey])
            .then(() => {
              updateTable();
            })
            .catch((error) => {
              console.error("Generic error: " + error);
              alert("An error occurred during the delete operation");
            })
            .finally(() => {
              db.close();
              updateTable();
            });
        }
      });
    } else {
      setNewRowValue({});
      console.log("You have selected: Cancel");
    }
  };  

  async function handleAddRow() {
    const newRecord = {};
    Object.keys(tableData[0]).forEach((key) => {
      newRecord[key] = '';
    });
  
    const db = new Dexie(nomeDb);
  
    try {
      await db.open();
      await db.transaction('rw', tableName, async () => {
        const table = db.table(tableName);
        const primaryKey = await table.add(newRecord);
        const insertedRecord = await table.get(primaryKey);
        setTableData([...tableData, insertedRecord]);
        handleEditRow(insertedRecord);
        await updateTable(); 
      });
    } catch (error) {
      console.error(error);
    }
  }  
  
  function handleRowSelect(event, row) {
    const rowString = JSON.stringify(row);

    if (event.target.checked) {
      setSelectedRows([...selectedRows, rowString]);
    } else {
      setSelectedRows(selectedRows.filter((selectedRowString) => selectedRowString !== rowString));
    }

    const db = new Dexie(nomeDb);
    db.open().catch((error) => {
      console.error(error.stack || error);
    });

    console.log("You selected/deselected a row");
  }

  function handleSelectAll(event) {
    setSelectAll(event.target.checked);
    if (event.target.checked) {
      const allRows = searchedRows.concat(tableData).slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
      const selectedRows = allRows.map(row => JSON.stringify(row));
      setSelectedRows(selectedRows);
    } else {
      setSelectedRows([]);
    }
  }  
  
  async function handleDeleteFunction(row) {
    const db = new Dexie(nomeDb);
    await db.open();
    const table = db.table(tableName);
    const primaryKey = table.schema.primKey.keyPath;
    if (!primaryKey) {
      console.error("Table " + tableName + " does not have a primary key defined");
      return;
    }
    const primaryKeyObj = Object.fromEntries(Array.isArray(primaryKey) ? primaryKey.map(key => [key, row[key]]) : [[primaryKey, row[primaryKey]]]);
    const where = Object.fromEntries(Object.entries(primaryKeyObj).filter(([_, v]) => v != null));
    table.where(where).delete().then(() => {
      console.log("Successfully deleted " + tableName + " items");
      return table.toArray();
    }).then((data) => {
      setTableData(data);
    }).catch((error) => {
      console.error("Error deleting items from Dexie database:", error);
    });
  }
  
  async function handleDeleteSelectedRowsFunction() {
    const db = new Dexie(nomeDb);
    await db.open();
    const table = db.table(tableName);
    const primaryKey = table.schema.primKey.keyPath;
    if (!primaryKey) {
      console.error("Table " + tableName + " does not have a primary key defined");
      return;
    }
    selectedRows.forEach(async (selectedRowString) => {
      const selectedRow = JSON.parse(selectedRowString);
      const primaryKeyObj = Object.fromEntries(Array.isArray(primaryKey) ? primaryKey.map(key => [key, selectedRow[key]]) : [[primaryKey, selectedRow[primaryKey]]]);
      const where = Object.fromEntries(Object.entries(primaryKeyObj).filter(([_, v]) => v != null));
      await table.where(where).delete();
    });
    table.toArray().then((data) => {
      setTableData(data);
      setSelectedRows([]);
      console.log("You have eliminated several elements at once");
    }).catch((error) => {
      console.error("Error deleting items from Dexie database:", error);
    });
  }  
  
  async function handleSubmitFunction(event) {
    event.preventDefault();
    const db = new Dexie(nomeDb);

    await db.open().catch(function(error) {
      console.error(error.stack || error);
    });

    let table = db.table(tableName);

    if (!table) {
      console.log('Table not found');
      return;
    }

    const data = await table.toArray().catch(function(error) {
      console.error(error.stack || error);
    });
    
    const filteredData = data.filter((row) => {
      return Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    
    setTableData(filteredData);
  }
  
  async function handleSearchs(value) {
    const db = new Dexie(nomeDb);
    await db.open();

    const tableNames = db.tables.map((table) => table.name);
  
    const newResults = [];
    for (let i = 0; i < tableNames.length; i++) {
      const tableName = tableNames[i];
      const table = db.table(tableName);
  
      const data = await table.toArray().catch((error) => {
        console.error(error.stack || error);
      });
  
      for (let j = 0; j < data.length; j++) {
        const row = data[j];
        for (const property in row) {
          if (row[property] === value) {
            const result = {
              tableName,
              fieldName: property,
              items: [row]
            };
      
            const existingResult = newResults.find(r => r.tableName === tableName && r.fieldName === property);
            if (existingResult) {
              existingResult.items.push(row);
            } else {
              newResults.push(result);
            }
            setSearchHistory((prevHistory) => [ ...prevHistory,{ query: value, tableName, fieldName: property }      ]);
          }
        }
      }
    }
    setSearchResults(newResults);
  }

  function SearchResults({ results }) {
    const counts = {};
    return (
      <div>
        {results.map((result, index) => (
          <div key={index}>
            <div className="table-header">
              <h2>{result.tableName}</h2>
            </div>
            <table className="table">
              <thead>
                <tr>
                  {Object.keys(result.items[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>

                {result.items.map((item, index) => {
                  const value = item[result.fieldName];
                  const count = counts[value] || 0;
                  counts[value] = count + 1;
  
                  return (
                    <tr key={index}>
                      {Object.keys(item).map((key) => (
                        <td key={key} style={{ whiteSpace: 'pre-wrap' }}>
                          {key === result.fieldName ? `${value} (${count})` : item[key]}
                        </td>
                      ))}
  
                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        ))}
     </div>
    );
  }
  
  /* ====================================================================================================== */
              /* ============================= RETURN ================================== */

  return (
    <>
    <div className="parent-container">
      <div className="sidebar-container">
        <div className="container">
            <div className="sidebar">
              <div className="sidebar-header">
                <i className="fas fa-database"></i>
                <div className="navbar__db">
                  <FontAwesomeIcon icon={faDatabase} className="navbar__db-icon" />
                  <h3>Tabella</h3>
                </div>
              </div>
              <div className="sidebar-search">
                <input
                    type="text"
                    placeholder="Cerca"
                    id="sidebar-search-input"
                    value={searchTerms}
                    onChange={handleSearchChange}
                  />
              </div>
              <ul className="table-names">
                {filteredTableNames.map((name) => (
                  <li
                    key={name}
                    className={name === tableName ? "active" : ""}
                    onClick={() => setTableName(name)}
                  >
                    {name}
                  </li>
                  ))}
              </ul>
            </div>
        </div>
      </div>

      <div className="button-container">
        <div className="results">
          <div className="navbar__right">
            <div className="navbar__db">
              <FontAwesomeIcon icon={faDatabase} className="navbar__db-icon" />
              <div className="navbar__db-divider"></div>
              <h3 className="navbar__db-title">Database Selezionato: {nomeDb}</h3>
            </div>
          </div>
          <span >Benvenuto/a, qui potrai gestire e consultare il tuo database locale</span>
            <form onSubmit={handleSubmitFunction}>
              <div className="button-wrapper">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Cerca"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                    {searchTerm && !isClear && (
                      <button className="search-clear" onClick={() => setIsClear(true)}>
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    )}
                    {isClear && (
                      <button className="search-clear" onClick={handleClear}>
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    )}
                    <button className="search-form" type="submit">
                      <FontAwesomeIcon icon={faSearch} />
                    </button>
                  </div>
                <button className="button-vis" type="submit">Visualizza</button>    
              </div>
            </form>
      </div>

      {tableData.length > 0 &&
        <div className="table-container">
          <div className="table-header">
            <div>
              <h2>{tableName}</h2>
              <p style={{ marginBottom: 0 }}>Risultati: {tableData.length}</p>
            </div>
            <div style={{ display: "inline-flex", backgroundColor: "#f5f5f5", borderRadius: "5px", padding: "5px" }}>
              <button className="icon-btn add-btn" title="Aggiungi Elemento" onClick={handleAddRow}>
                <FontAwesomeIcon icon={faPlus} color="#fff" />
              </button>
              <button onClick={handleDeleteSelectedRowsFunction} title="Elimina" disabled={selectedRows.length === 0} style={{ marginLeft: "5px", border: "none" }}>
                <FontAwesomeIcon icon={faTrashAlt} color={selectedRows.length > 0 ? "#ff0000" : "#c1c1c1"} />
              </button>
              <button className="toggle-btn" title="Modifica di Massa" onClick={toggleInputs}>
                {showInputs ? (
                  <FontAwesomeIcon icon={faPen} />
                ) : (
                  <FontAwesomeIcon icon={faPen} />
                )}
              </button>

              {showInputs && (
                <div className="input-container">
   
                <input className="input-field" id="oldValueInput" type="text" placeholder="Vecchio valore" />
                <input className="input-field" id="newValueInput" type="text" placeholder="Nuovo valore" />
                <div className="select-menu">
                  <select className="input-field" id="columnNameInput">
                    {Object.keys(tableData[0]).map((columnName, index) => (
                      <option key={index} value={columnName}>{columnName}</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleMassEdit} className="edit-btn">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </div>
              
              )}

          </div>
        </div>

        <table className="table">
          <thead>
            <tr>

              {Object.keys(tableData[0]).map((key) => (
                <th key={key}>{key}</th>      
              ))}
                <th className="specific-columns">Modifica</th>
                <th className="specific-columns">Elimina</th>
                <th className="specific-columns">
                  <label className="containers">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                    <div className="checkmark"></div>
                  </label>
                  Vis
                </th>
            </tr>
          </thead>

          <tbody>
            {searchedRows
              .concat(tableData)
              .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
              .map((row, index) => (
              <tr key={index}>
              {Object.keys(row).map((key) => (
                <td key={key} style={{ whiteSpace: 'pre-wrap' }}>
                  {row[key]}
                  {row[key] && (
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="icon-primary"
                      onClick={() => handleSearchs(row[key])}
                      style={{ marginLeft: '10px' }}
                    />
                  )}
                </td>
              ))}
            
                 <td>
                  <FontAwesomeIcon icon={faEdit} className="icon-primary" 
                    onClick={() => handleEditRow(row)} />
                 </td>

                 <td>
                  <FontAwesomeIcon icon={faTrashAlt} className="icon-danger" 
                    onClick={() => handleDeleteFunction(row)} /> 
                 </td>

                 <td>
                  <label className="containers">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(JSON.stringify(row))} 
                    onChange={(event) => handleRowSelect(event, row)} /> 
                      <div className="checkmark"></div>
                        </label>
                   </td>
                  </tr>
                ))}

                {editingRow && (
                  <tr>
                    {Object.keys(editingRow).map((key) => (
                      <td key={key}>
                        <textarea className="inputedit" value={newRowValue[key]} 
                          onChange={(e) => setNewRowValue({ ...newRowValue, [key]: e.target.value })} />
                      </td>
                    ))}
                    <td>
                      <button onClick={handleSavedRowFunction}>Salva</button>
                      <button onClick={handleCancelEditMod}>Annulla</button>
                    </td>
                  </tr>
                )}

                  <tr>
                    <td colSpan={Object.keys(tableData[0]).length + 3}></td>
                  </tr>
                  <tr>
                    <td colSpan={Object.keys(tableData[0]).length}>
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="d-flex align-items-center">
                          <label htmlFor="rows-per-page" className="me-2 mb-0">Rows per page:
                          </label>
                          <div className="position-relative">
                            <select className="form-select form-select-sm border-0 bg-light px-3 py-2 
                              rounded-3 shadow" id="rows-per-page" value={rowsPerPage} 
                              onChange={handleRowsPerPageChange}>
                              <option value={25}>25 </option>
                              <option value={50}>50 </option>
                              <option value={100}>100 </option>
                            </select>
                              <span className="position-absolute top-50 end-0 translate-middle-y">
                                <i className="bi bi-caret-down-fill"></i>
                              </span>
                          </div>
                        </div>
                        <div className="d-flex justify-content-center">
                          <ul className="pagination">
                            <li className="page-item">
                              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} 
                                disabled={currentPage === 1}>
                                <span aria-hidden="true">&laquo;</span>
                                <span className="visually-hidden">Previous</span>
                              </button>
                            </li>

                            {[...Array(Math.ceil((searchedRows.length + tableData.length) / rowsPerPage)).keys()]
                              .map((number) => (
                              <li key={number} className={`page-item ${number + 1 === currentPage ? 'active' : ''}`}>
                                <button className="page-link bg-transparent border-0" 
                                  onClick={() => handlePageChange(number + 1)} style={{ fontWeight: 'bold', 
                                  color: number + 1 === currentPage ? '#007bff' : '#000' }}>{number + 1}</button>
                              </li>
                            ))}

                            <li className="page-item">
                              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === Math.ceil((searchedRows.length + tableData.length) / rowsPerPage)}>
                                <span aria-hidden="true">&raquo;</span>
                                <span className="visually-hidden">Next</span>
                              </button>
                            </li>
                         </ul>
                        </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
              <br></br>
              <div>
                {searchHistory.length > 0 && (
                  <div className="results">
                    <button className="button-vis" onClick={() => setShowResults(!showResults)}>
                      {showResults ? 'Nascondi' : 'Mostra'} Risultati
                    </button>

                    <span>Ricerche effettuate</span>
                    <ul>
                      {searchHistory.map((search, index) => {
                        const searchString = `${search.query}-${search.tableName}-${search.fieldName}`;
                        if (!searchCount[searchString]) {
                          searchCount[searchString] = 1;
                        } else {
                          searchCount[searchString]++;
                        }
                        if (searchCount[searchString] === 1) {
                          return (
                            <li key={index}>
                            Ricerca per <span style={{ fontWeight: 'bold', color: 'red' }}>{search.query}</span> trovata in tabella <span style={{ fontWeight: 'bold', color: 'red' }}>{search.tableName}</span> campo <span style={{ fontWeight: 'bold', color: 'red' }}>{search.fieldName}</span> ({searchCount[searchString]})
                            </li>
                          
                          );
                        } else {
                          return null;
                        }
                      })}
                    </ul>

                    <button className="button-vis" onClick={handleClearHistory}>Cancella Cronologia</button>
                  </div>
                )}

                {showResults && searchResults.length > 0 && <SearchResults results={searchResults} />}
              </div>

            </div>
      
        }

      </div>
    </div>

      </>
    );
  
  }
