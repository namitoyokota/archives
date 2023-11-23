using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Data.SqlClient;

namespace GroceryBama
{
    public partial class BuyerAccountInformation : Form
    {
        List<GROCERYSTORE> stores = new List<GROCERYSTORE>();
        public BuyerAccountInformation()
        {
            InitializeComponent();
            LoadAll();
            LoadText();
        }

        private void button7_Click(object sender, EventArgs e)
        {
            this.Close();
        }
        
        private void LoadText()
        {
            textHouseNumber.Text = Globals.Persistent_Address.house_number;
            textStreet.Text = Globals.Persistent_Address.street;
            textCity.Text = Globals.Persistent_Address.city;
            textEmail.Text = Globals.Persistent_Current.email;
            textFirstName.Text = Globals.Persistent_Current.first_name;
            textLastName.Text = Globals.Persistent_Current.last_name;
            textPhone.Text = Globals.Persistent_Buyer.phone;
            textCreditCardNumber.Text = Globals.Preferred_Credit;
            comboStore.Text = Globals.Persistent_Store.store_id + " - " + Globals.Persistent_Store.store_name;
            textRoutingNumber.Text = Globals.Preferred_Routing;
            textState.Text = Globals.Persistent_Address.state;
            textStoreAddress.Text = Globals.Store_Address.house_number + " " + Globals.Store_Address.street;
            textUsername.Text = Globals.Persistent_Current.username;
            textZip.Text = Globals.Persistent_Address.zip_code;
            
            foreach(var item in stores)
            {
                string comboAdd = "";
                comboAdd += item.store_id;
                comboAdd += " - ";
                comboAdd += item.store_name;
                comboStore.Items.Add(comboAdd);
            }
        }

        private void button_delete_Click(object sender, EventArgs e)
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string query = "DELETE from [GROCERYBAMA1].[dbo].[USER] where username = @username;";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
            }
            Globals.has_deleted = true;
            MessageBox.Show("Delete Successful.");
            this.Close();
        }
        private void button_update_Click(object sender, EventArgs e)
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string query = "UPDATE [User] SET username = @username, password = @password, user_type = 'buyer', email = @email, first_name = @first_name, last_name = @last_name WHERE username = @old_username";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    command.Parameters.Add("@old_username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    command.Parameters.Add("@password", SqlDbType.VarChar).Value = Globals.Persistent_Current.password;
                    command.Parameters.Add("@email", SqlDbType.VarChar).Value = textEmail.Text;
                    command.Parameters.Add("@first_name", SqlDbType.VarChar).Value = textFirstName.Text;
                    command.Parameters.Add("@last_name", SqlDbType.VarChar).Value = textLastName.Text;
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }

                Globals.Persistent_Current.email = textEmail.Text;
                Globals.Persistent_Current.first_name = textFirstName.Text;
                Globals.Persistent_Current.last_name = textLastName.Text;

                query = "UPDATE [BUYER] SET username = @username, phone = @phone, address_id = @address_id, default_payment = @default_payment, default_store_id = @default_store_id where username = @old_username";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    command.Parameters.Add("@old_username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    command.Parameters.Add("@phone", SqlDbType.VarChar).Value = textPhone.Text;
                    command.Parameters.Add("@address_id", SqlDbType.Int).Value = Globals.Persistent_Address.id;
                    command.Parameters.Add("@default_payment", SqlDbType.VarChar).Value = Globals.Preferred_Credit;
                    command.Parameters.Add("@default_store_id", SqlDbType.Int).Value = Int32.Parse(comboStore.Text.Split('-')[0].Trim());
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }

                Globals.Persistent_Buyer.phone = textPhone.Text;
                Globals.Persistent_Buyer.default_store_id = Int32.Parse(comboStore.Text.Split('-')[0].Trim());

                query = "UPDATE [ADDRESS] SET id = @id, house_number = @house_number, street = @street, city = @city, state = @state, zip_code = @zip_code where id = @old_id";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@id", SqlDbType.Int).Value = Globals.Persistent_Address.id;
                    command.Parameters.Add("@old_id", SqlDbType.Int).Value = Globals.Persistent_Address.id;
                    command.Parameters.Add("@house_number", SqlDbType.Int).Value = Int32.Parse(textHouseNumber.Text);
                    command.Parameters.Add("@street", SqlDbType.VarChar).Value = textStreet.Text;
                    command.Parameters.Add("@city", SqlDbType.VarChar).Value = textCity.Text;
                    command.Parameters.Add("@state", SqlDbType.VarChar).Value = textState.Text;
                    command.Parameters.Add("@zip_code", SqlDbType.Int).Value = Int32.Parse(textZip.Text);
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }

                Globals.Persistent_Address.city = textCity.Text;
                Globals.Persistent_Address.house_number = textHouseNumber.Text;
                Globals.Persistent_Address.street = textStreet.Text;
                Globals.Persistent_Address.zip_code = textZip.Text;
                Globals.Persistent_Address.state = textState.Text;

                foreach(var item in stores)
                {
                    if(Int32.Parse(comboStore.Text.Split('-')[0].Trim()) == item.store_id)
                    {
                        Globals.Persistent_Store = item;
                        break;
                    }
                }
                query = "select * from address where id = @store_id";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@store_id", SqlDbType.Int).Value = Globals.Persistent_Store.address_id;
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(command);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        ADDRESS addAddress = new ADDRESS();
                        addAddress.id = Int32.Parse(dr["id"].ToString());
                        addAddress.house_number = dr["house_number"].ToString();
                        addAddress.state = dr["state"].ToString();
                        addAddress.street = dr["street"].ToString();
                        addAddress.city = dr["city"].ToString();
                        addAddress.zip_code = dr["zip_code"].ToString();

                        Globals.Store_Address = addAddress;
                    }
                }
                MessageBox.Show("Update Successful.");
                this.Close();
            }
        }
        private void LoadAll()
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            string queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[grocerystore] ORDER BY store_id";
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        GROCERYSTORE addStore = new GROCERYSTORE();
                        addStore.store_id = Int32.Parse(dr["store_id"].ToString());
                        addStore.store_name = dr["store_name"].ToString();
                        addStore.phone = dr["phone"].ToString();
                        addStore.address_id = Int32.Parse(dr["address_id"].ToString());
                        addStore.opening_time = dr["opening_time"].ToString();
                        addStore.closing_time = dr["closing_time"].ToString();
                        stores.Add(addStore);
                    }
                }
            }
        }
    }
}
