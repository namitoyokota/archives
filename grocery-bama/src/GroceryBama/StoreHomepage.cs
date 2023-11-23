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
    public partial class StoreHomepage : Form
    {
        public StoreHomepage()
        {
            InitializeComponent();
        }

        private void button4_Click(object sender, EventArgs e)
        {
            FindItem form = new FindItem();
            form.ShowDialog();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            DialogResult dialog = new DialogResult();
            dialog = MessageBox.Show("Going back will delete your current order. Are you sure you want to do this?", "Alert!", MessageBoxButtons.YesNo);
            if (dialog == DialogResult.Yes)
            {
                Globals.cart.Clear();
                this.Close();
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            if (!Globals.cart.Any())
            {
                MessageBox.Show("There is nothing in your cart.");
                return;
            }
            ViewCart form = new ViewCart();
            form.ShowDialog();
        }

        private void button_cancel_Click(object sender, EventArgs e)
        {
            DialogResult dialog = new DialogResult();
            dialog = MessageBox.Show("Are you sure you want to delete your current order? This action cannot be undone.", "Alert!", MessageBoxButtons.YesNo);
            if (dialog == DialogResult.Yes)
            {
                Globals.cart.Clear();
                this.Close();
            }
        }
    }
}
