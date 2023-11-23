using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace GroceryBama
{
    public partial class DelivererFunctionality : Form
    {
        public DelivererFunctionality()
        {
            InitializeComponent();
        }

        private void button_back_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void button_accountinfo_Click(object sender, EventArgs e)
        {
            if (Globals.has_deleted)
            {
                this.Close();
            }
            DelivererAccountInformation form = new DelivererAccountInformation();
            form.ShowDialog();
        }

        private void button_assignments_Click(object sender, EventArgs e)
        {
            if (Globals.has_deleted)
            {
                this.Close();
            }
            DelivererAssignments form = new DelivererAssignments();
            form.ShowDialog();
        }
    }
}
