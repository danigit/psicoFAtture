<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 27/12/18
 * Time: 17.16
 */

require_once 'config.php';
require_once 'db_errors.php';

class Connection{

    private $connection, $query, $result;

    /**
     * Constructor that creates a new connection to the database
     */
    public function __construct(){
        $this->connection = new mysqli(PATH, USERNAME, PASSWORD, DATABASE);

        if (!$this->connection)
            echo 'Connessine non riuscita';
    }

    /**
     * Desctructor that close the existing connection to the database
     */
    function __destruct(){
        $this->connection->close();
    }

    function test(){
        $query = 'SELECT * FROM test';

        $this->result = $this->connection->query($query);

        if ($this->result == false)
            return new db_errors(db_errors::$ERROR_ON_TEST);

        while ($row = mysqli_fetch_assoc($this->result)) {
            $this->result[] = $row['test'];
        }
        return $this->result;
    }

    /**
     * Function that insert a new user in USERS table
     * @param $email - the email of the user
     * @param $password - the password of the user
     * @return db_errors|mixed - the id fo
     */
    function register($email, $password){
        $hash_code = password_hash($password, PASSWORD_BCRYPT);

        $this->query = 'INSERT INTO users (email, password) VALUES (?, ?)';

        $this->result = $this->execute_inserting($this->query, 'ss', $email, $hash_code);

        if ($this->result instanceof db_errors)
            return $this->result;
        elseif ($this->result == false)
            return new db_errors(db_errors::$ERROR_ON_REGISTER_USER);

        return $this->connection->insert_id;
    }

    /**
     * Function that controls the user email and user password passed as parameter are in database
     * @param $email - user email
     * @param $password - user password
     * @return db_errors|mysqli_stmt - the user id on success or an error on fail
     */
    function login($email, $password){
        $this->query = 'SELECT id, password FROM users WHERE  email = ?';

        $statement = $this->execute_selecting($this->query, 's', $email);

        if ($statement instanceof db_errors)
            return $statement;
        else if ($statement == false)
            return new db_errors(db_errors::$ERROR_ON_LOGIN);

        $statement->bind_result($res_id, $res_pass);
        $fetch = $statement->fetch();

        if ($fetch && password_verify($password, $res_pass))
            return $res_id;

        return new db_errors(db_errors::$ERROR_ON_LOGIN);
    }

    /**
     * Function that retrieve the last 10 invoices
     * @return array|db_errors|mysqli_result
     */
    function get_last_invoices(){
        $this->query = 'SELECT invoice.id, p.id AS patientId, invoice.description, name, surname, date FROM invoice JOIN patient p 
                        ON invoice.patient = p.id ORDER BY date DESC ';

        $this->result = $this->connection->query($this->query);

        if ($this->result == false)
            return new db_errors(db_errors::$ERROR_ON_LOGIN);

        $return_result = array();

        while ($row = mysqli_fetch_assoc($this->result)){
            $return_result[] = array('number' => $row['id'], 'patientId' => $row['patientId'], 'description' => $row['description'], 'name' => $row['name'], 'surname' => $row['surname'], 'date' => $row['date']);
        }

        return $return_result;
    }

    /**
     * Function that retrieve all the patients
     * @return array|db_errors
     */
    function get_patients(){
        $this->query = 'SELECT * FROM patient';

        $this->result = $this->connection->query($this->query);

        if ($this->result == false)
            return new db_errors(db_errors::$ERROR_ON_LOGIN);

        $return_result = array();

        while ($row = mysqli_fetch_assoc($this->result)){
            $return_result[] = array('number' => $row['id'], 'name' => $row['name'], 'surname' => $row['surname'],
                'street' => $row['street'], 'fiscal_code' => $row['fiscal_code'], 'p_iva' => $row['p_iva']);
        }

        return $return_result;
    }

    /**
     * Function tha insert a new patient into database
     * @param $patient - the patient data
     * @return db_errors|mixed
     */
    function insert_patient($patient){
        $this->query = 'INSERT INTO patient (name, surname, street, fiscal_code, p_iva) VALUES (?, ?, ?, ?, ?)';
        $this->result = $this->execute_inserting($this->query, "sssss", $patient['name'], $patient['surname'], $patient['street'],
                                                    $patient['fiscal_code'], $patient['p_iva']);

        if ($this->result instanceof db_errors) {
            return $this->result;
        } else if ($this->result) {
            return $this->connection->insert_id;
        }

        return new db_errors(db_errors::$ERROR_ON_INSERTING_PATIENT);
    }

    /**
     * Function tha update an existing patient
     * @param $patient - data to be updated
     * @return db_errors|int
     */
    function update_patient($patient){
        $this->query = "UPDATE patient SET name=?, surname=?, street=?, fiscal_code=?, p_iva=? WHERE id=?";

        $this->result = $this->execute_selecting($this->query, "sssssi", $patient['name'], $patient['surname'], $patient['street'],
                                                $patient['fiscal_code'], $patient['p_iva'], $patient['number']);

        if($this->result instanceof db_errors)
            return $this->result;

        if($this->result === false)
            return new db_errors(db_errors::$ERROR_ON_UPDATING_PATIENT);

        return $this->connection->affected_rows;
    }

    /**
     * Function that deletes an patient from the database
     * @param $id
     * @return bool|db_errors
     */
    function remove_patient($id){
        $this->query = "DELETE FROM patient WHERE id = ?";
        $this->result = $this->execute_selecting($this->query, "i", $id);

        if ($this->result instanceof db_errors)
            return $this->result;

        return $this->result->affected_rows == 1 ? true : new db_errors(db_errors::$ERROR_ON_DELETING_PATIENT);
    }

    /**
     * Function that gets the id of the last inserted invoice
     * @return array|db_errors
     */
    function get_invoice_number(){
        $this->query = 'SELECT id FROM invoice ORDER BY id DESC  LIMIT  1';

        $this->result = $this->connection->query($this->query);

        if ($this->result == false)
            return new db_errors(db_errors::$ERROR_ON_LOGIN);

        $return_result = array();

        while ($row = mysqli_fetch_assoc($this->result)){
            $return_result = $row['id'];
        }

        return $return_result;
    }

    /**
     * Function that inserts a new invoice into the database
     * @param $patient
     * @return db_errors|mixed
     */
    function insert_invoice($patient){
        $this->query = 'INSERT INTO invoice (description, date, patient) VALUES (?, ?, ?)';

        $this->result = $this->execute_inserting($this->query, "sss", $patient['description'], $patient['date'], $patient['patientId']);

        if ($this->result instanceof db_errors) {
            return $this->result;
        } else if ($this->result) {
            return $this->connection->insert_id;
        }

        return new db_errors(db_errors::$ERROR_ON_INSERTING_INVOICE);
    }

    /**
     * Function that uses the execute statement to execute a query with the prepare statement
     * @param $query - the query to be executed
     * @param $bind_string - the string containing the types of the parameters of the query
     * @param mixed ...$params - the parameters of the query
     * @return bool|db_errors - the result of the query
     */
    function execute_inserting($query, $bind_string, ...$params){
        $statement = $this->connection->prepare($query);
        $bind_names[] = $bind_string;

        for ($i = 0; $i < count($params); $i++){
            $bind_name = 'bind' . $i;
            $$bind_name = $params[$i];
            $bind_names[] = &$$bind_name;
        }

        call_user_func_array(array($statement, 'bind_param'), $bind_names);

        try{
            $result = $statement->execute();
            if ($result == false)
                return parse_errors($statement->error_list[0]);
        }catch (Exception $e){
            return new db_errors(db_errors::$ERROR_ON_EXECUTE);
        }

        $statement->close();
        return $result;
    }

    /**
     * Function that uses the execute statement to execute a query with the prepare statement
     * @param $query - the query to be executed
     * @param $bind_string - the string containing the types of the parameters of the query
     * @param mixed ...$params - the parameters of the query
     * @return mysqli_stmt|db_errors
     */
    function execute_selecting($query, $bind_string, ...$params){
        $statement = $this->connection->prepare($query);
        $bind_names[] = $bind_string;

        for ($i = 0; $i < count($params); $i++){
            $bind_name = 'bind' . $i;
            $$bind_name = $params[$i];
            $bind_names[] = &$$bind_name;
        }

        call_user_func_array(array($statement, 'bind_param'), $bind_names);

        try{
            $statement->execute();
        }catch (Exception $e){
            return new db_errors(db_errors::$ERROR_ON_EXECUTE);
        }

        return $statement;
    }
}