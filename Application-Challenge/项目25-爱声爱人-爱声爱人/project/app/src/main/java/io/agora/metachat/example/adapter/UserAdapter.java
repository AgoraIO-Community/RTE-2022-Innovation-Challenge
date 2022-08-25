package io.agora.metachat.example.adapter;

import android.view.LayoutInflater;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import coil.ImageLoaders;
import coil.request.ImageRequest;
import io.agora.metachat.MetachatUserInfo;
import io.agora.metachat.example.databinding.ItemUserListBinding;

public class UserAdapter extends RecyclerView.Adapter<UserAdapter.ViewHolder> {

    private MetachatUserInfo[] localDataSet;

    /**
     * Provide a reference to the type of views that you are using
     * (custom ViewHolder).
     */
    public static class ViewHolder extends RecyclerView.ViewHolder {
        public final ItemUserListBinding binding;

        public ViewHolder(ItemUserListBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
            // Define click listener for the ViewHolder's View
        }
    }

    /**
     * Initialize the dataset of the Adapter.
     *
     * @param dataSet String[] containing the data to populate views to be used
     *                by RecyclerView.
     */
    public UserAdapter(MetachatUserInfo[] dataSet) {
        localDataSet = dataSet;
    }

    // Create new views (invoked by the layout manager)
    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup viewGroup, int viewType) {
        // Create a new view, which defines the UI of the list item
        return new ViewHolder(ItemUserListBinding.inflate(
                LayoutInflater.from(viewGroup.getContext()), viewGroup, false));
    }

    // Replace the contents of a view (invoked by the layout manager)
    @Override
    public void onBindViewHolder(ViewHolder viewHolder, final int position) {
        // Get element from your dataset at this position and replace the
        // contents of the view with that element
        viewHolder.binding.nickname.setText(localDataSet[position].mUserName);
        ImageRequest request = new ImageRequest.Builder(viewHolder.itemView.getContext())
                .data(localDataSet[position].mUserIconUrl)
                .target(viewHolder.binding.avatar)
                .build();
        ImageLoaders.create(viewHolder.itemView.getContext()).enqueue(request);
    }

    // Return the size of your dataset (invoked by the layout manager)
    @Override
    public int getItemCount() {
        return localDataSet.length;
    }

}
