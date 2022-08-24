package com.qingkouwei.handyinstruction.section.chat.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import com.qingkouwei.handyinstruction.common.livedatas.SingleSourceLiveData;
import com.qingkouwei.handyinstruction.common.net.Resource;
import com.qingkouwei.handyinstruction.common.repositories.EMConferenceManagerRepository;
import com.qingkouwei.handyinstruction.section.chat.model.KV;
import java.util.List;

public class ConferenceInviteViewModel extends AndroidViewModel {
    EMConferenceManagerRepository repository;
    private SingleSourceLiveData<Resource<List<KV<String, Integer>>>> conferenceInviteObservable;

    public ConferenceInviteViewModel(@NonNull Application application) {
        super(application);
        repository = new EMConferenceManagerRepository();
        conferenceInviteObservable = new SingleSourceLiveData<>();
    }

    public void getConferenceMembers(String groupId, String[] existMember) {
        conferenceInviteObservable.setSource(repository.getConferenceMembers(groupId,existMember));
    }

    public LiveData<Resource<List<KV<String, Integer>>>> getConferenceInvite() {
        return conferenceInviteObservable;
    }
}
