<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 27/12/18
 * Time: 17.22
 */

require_once '../database/connection.php';

abstract class communication{
    private $connection;

    /**
     * Function the intantiate a new connection (if there isn't one) to the database
     * @return Connection - the instantiated connection
     */
    protected function get_connection(){
        if (!isset($this->connection))
            $this->connection = new Connection();

        return $this->connection;
    }
}